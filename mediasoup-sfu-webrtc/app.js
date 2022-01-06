// SERVER SIDE

import express from "express";
const app = express();

import https from "httpolyglot";
import fs from "fs";
import path from "path";
const __dirname = path.resolve();

import { Server } from "socket.io";
import mediasoup from "mediasoup";

app.get("/", (req, res) => {
  res.send("Hello from mediasoup app!");
});

//middle-ware 사용. /public 디렉토리 사용
app.use("/sfu", express.static(path.join(__dirname, "public")));

//https 위한 key-cert 쌍 생성
//openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
//openssl rsa -in keytmp.pem -out key.pem
const options = {
  key: fs.readFileSync("./server/ssl/key.pem", "utf-8"),
  cert: fs.readFileSync("./server/ssl/cert.pem", "utf-8"),
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(3000, () => {
  console.log("listening on port : " + 3000);
});

const io = new Server(httpsServer);

const peers = io.of("/mediasoup");

//https://mediasoup.org/documentation/v3/mediasoup/api/#Worker
//워커는 하나의 프로세스로 서버의 core한개를 점유
let worker;

//https://mediasoup.org/documentation/v3/mediasoup/api/#Router
//라우터는 audio/video rtp를 교환하는 단위로 produers와 consumer로 구별됨
//하나의 워커에 속해 하나의 코어를 점유하고 동일 워커의 다른 라우터와 코어를 공유
let router;

let producerTransport;
let consumerTransport;
let producer;
let consumer;

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  });

  console.log(`worker pid ${worker.pid}`);

  worker.on("died", (error) => {
    console.error("mediasoup worker had died");

    //2초 timeout
    setTimeout(() => process.exit(1), 2000);
  });

  return worker;
};

worker = createWorker();

//코덱 정의
const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  },
];

peers.on("connection", async (socket) => {
  console.log(socket.id);
  socket.emit("connection-success", {
    socketId: socket.id,
  });

  socket.on("disconnect", () => {
    console.log("peer disconnected");
  });

  router = await worker.createRouter({ mediaCodecs });

  socket.on("getRtpCapabilities", (callback) => {
    const rtpCapabilities = router.rtpCapabilities;
    //console.log('rtp Capabilities', rtpCapabilities)

    callback({ rtpCapabilities });
  });

  socket.on("createWebRtcTransport", async ({ sender }, callback) => {
    console.log(`Is this a sender request? ${sender}`);

    if (sender) producerTransport = await createWebRtcTransport(callback);
    else consumerTransport = await createWebRtcTransport(callback);
  });

  socket.on("transport-connect", async ({ dtlsParameters }) => {
    console.log("DTLS PARAMS...", { dtlsParameters });

    await producerTransport.connect({ dtlsParameters });
  });

  socket.on(
    "transport-produce",
    async ({ kind, rtpParameters, appData }, callback) => {
      producer = await producerTransport.produce({
        kind,
        rtpParameters,
      });

      console.log("Producer ID: ", producer.id, producer.kind);

      producer.on("transportclose", () => {
        console.log("transport for this producer closed");
        producer.close();
      });

      callback({
        id: producer.id,
      });
    }
  );

  socket.on("transport-recv-connect", async ({ dtlsParameters }) => {
    console.log(`DTLS PARAMS: ${dtlsParameters}`);
    await consumerTransport.connect({ dtlsParameters });
  });

  socket.on("consume", async ({ rtpCapabilities }, callback) => {
    try {
        if (
            router.canConsume({
                producerId: producer.id,
                rtpCapabilities,
            })
        ){
        consumer = await consumerTransport.consume({
            producerId: producer.id,
             rtpCapabilities,
             paused: true,
        });

        consumer.on("transportclose", () => {
            console.log("transport close from consumer");
        });

        consumer.on("producerclose", () => {
            console.log("producer of consumer closed");
        });


        const params = {
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
        };

        // send the parameters to the client
        callback({ params });
        }
    } catch (error) {
        console.log(error.message);
        callback({
            params: {
                error: error,
            },
        });
    }
});

  socket.on("consumer-resume", async () => {
      console.log("consumer resume");
      await consumer.resume();
    });
});

const createWebRtcTransport = async (callback) => {
  try {
      const webRtcTransport_options = {
        listenIps: [
            {
            ip: "0.0.0.0",
            announcedIp: "127.0.0.1",
            },
        ],
        enableUdp: true,
        enableTcp: true,
        perferUdp: true,
        };

    let transport = await router.createWebRtcTransport(webRtcTransport_options);
    console.log(`transport id: ${transport.id}`);

    transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "closed") transport.close();
    });

    transport.on("close", () => {
        console.log("transport closed");
    });

    callback({
        params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        },
    });

    return transport;
    } catch (error) {
        console.log(error);
        callback({
            params: {
                error: error,
            },
        });
    }
};

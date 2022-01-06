//Client Side

const io = require("socket.io-client");
const mediasoupClient = require("mediasoup-client");
const socket = io("/mediasoup");

socket.on("connection-success", ({ socketId }) => {
  console.log(socketId);
});

//https://mediasoup.org/documentation/v3/mediasoup-client/api/#Device
//장치는 미디어를 전송 및/또는 수신하기 위해 미디어수프 라우터에 연결하는 엔드포인트를 나타냄
let device;
let rtpCapabilities;
let producerTransport;
let consumerTransport;
let producer;
let consumer;

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
let params = {
  //mediasoup 파라미터
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

//stream function
const streamSuccess = async (stream) => {
  localVideo.srcObject = stream;
  const track = stream.getVideoTracks()[0];
  params = {
    track,
    ...params,
  };
};

//localStream가져오기.
//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
const getLocalStream = () => {
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        width: {
          min: 640,
          max: 1920,
        },
        height: {
          min: 400,
          max: 1080,
        },
      },
    })
    .then(streamSuccess)
    .catch((error) => {
      console.log(error.message);
    });
};

const createDevice = async () => {
  try {
    device = new mediasoupClient.Device();

    //미디어수프 라우터의 RTP cap을 장치로 로드
    //장치가 허용된 미디어 코덱 및 기타 설정에 대해 아는 방법
    await device.load({
      routerRtpCapabilities: rtpCapabilities,
    });

    console.log("RTP Capabilities", rtpCapabilities);
  } catch (error) {
    console.log(error);
    if (error.name === "UnsupportedError")
      console.warn("browser not supported");
  }
};

btnLocalVideo.addEventListener("click", getLocalStream);

const getRtpCapabilities = () => {
  socket.emit("getRtpCapabilities", (data) => {
    console.log(`Router RTP Capabilites... ${data.rtpCapabilities}`);

    rtpCapabilities = data.rtpCapabilities;
  });
};

btnRtpCapabilities.addEventListener("click", getRtpCapabilities);
btnDevice.addEventListener("click", createDevice);

//https://mediasoup.org/documentation/v3/communication-between-client-and-server/
const createSendTransport = () => {
  socket.emit("createWebRtcTransport", { sender: true }, ({ params }) => {
    if (params.error) {
      console.log(params.error);
      return;
    }

    console.log(params);

    producerTransport = device.createSendTransport(params);

    producerTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          // 로컬 DTLS 파라미터를 serverside transport로 signal
          await socket.emit("transport-connect", {
            //transportId: producerTransport.id,
            dtlsParameters: dtlsParameters,
          });

          // transport에 파라미터가 전송되었다고 알림
          callback();
        } catch (error) {
          errback(error);
        }
      }
    );

    producerTransport.on("produce", async (parameters, callback, errback) => {
      console.log(parameters);

      try {
        await socket.emit(
          "transport-produce",
          {
            transportId: producerTransport.id,
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
          },
          ({ id }) => {
            //transport에 파라미터가 전송되었음을 알림
            callback({ id });
          }
        );
      } catch (error) {
        errback(error);
      }
    });
  });
};

btnCreateSendTransport.addEventListener("click", createSendTransport);

const connectSendTransport = async () => {
  producer = await producerTransport.produce(params);

  producer.on("trackended", () => {
    console.log("track ended");

    //close video track
  });

  producer.on("transportclose", () => {
    console.log("transport ended");

    //close video track
  });
};

btnConnectSendTransport.addEventListener("click", connectSendTransport);

const createRecvTransport = async () => {
  await socket.emit(
    "createWebRtcTransport",
    { sender: false },
    ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      console.log(params);

      // creates a new WebRTC Transport to receive media
      // based on server's consumer transport params
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-createRecvTransport
      consumerTransport = device.createRecvTransport(params);

      // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
      // this event is raised when a first call to transport.produce() is made
      // see connectRecvTransport() below
      consumerTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          try {
            // Signal local DTLS parameters to the server side transport
            // see server's socket.on('transport-recv-connect', ...)
            await socket.emit("transport-recv-connect", {
              dtlsParameters,
            });

            // Tell the transport that parameters were transmitted.
            callback();
          } catch (error) {
            // Tell the transport that something was wrong
            errback(error);
          }
        }
      );
    }
  );
};

btnRecvSendTransport.addEventListener("click", createRecvTransport);

const connectRecvTransport = async () => {
  // for consumer, we need to tell the server first
  // to create a consumer based on the rtpCapabilities and consume
  // if the router can consume, it will send back a set of params as below
  await socket.emit('consume', {
    rtpCapabilities: device.rtpCapabilities,
  }, async ({ params }) => {
    if (params.error) {
      console.log('Cannot Consume')
      return
    }

    console.log(params)
    // then consume with the local consumer transport
    // which creates a consumer
    consumer = await consumerTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters
    })

    // destructure and retrieve the video track from the producer
    const { track } = consumer

    remoteVideo.srcObject = new MediaStream([track])

    // the server consumer started with media paused
    // so we need to inform the server to resume
    socket.emit('consumer-resume')
  })
}

btnConnectRecvTransport.addEventListener('click', connectRecvTransport)

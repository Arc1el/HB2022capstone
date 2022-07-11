module.exports = {
  listenIp: '0.0.0.0',
  listenPort: 7070, 
  sslCrt: './ssl/server.crt',
  sslKey: './ssl/server.key',
  mediasoup: {
    // Worker settings
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: 'warn',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ],
    },
    // Router settings
    router: {
      mediaCodecs:
        [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
          },

          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters:
              {
                'x-google-start-bitrate': 1000
              }
          },
        ]
    },
    // WebRtcTransport settings
    webRtcTransport: {
      /*
      listenIps: [
        {
          ip: '192.168.0.254',
          //ip: '182.230.242.195',
          announcedIp: null,
        }
      ],*/
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: "182.230.242.195" || "127.0.0.1",
        }
      ],
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000,
    }
  }
};

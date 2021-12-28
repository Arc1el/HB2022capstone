# Media Sever를 둔 N:N 관계의 meeting application

요구사항
-------------
1. Media Sever를 사용하여 meeting data를 저장하고 이를 접근할 수 있도록 해야 함.
2. 진단 의료 모듈의 경우 스마트폰과 usb연결을 통하여 데이터를 스마트폰으로 보낼 수 있어야 함.
> 스마트폰의 포트 규격에 맞추어 microSD, usb-c, lightning 등을 지원할 수 있어야 하고 전원공급, 데이터 송수신이 가능해야함.
3. 환자측에서는 스마트폰, 의사측은 스마트폰, PC등을 활용하여 접속할 수 있는 모바일 어플리케이션 / 웹앱 등을 제공해야함.

* * *

기술스택
-------------
백엔드
> - Kurento : 웹/모바일 환경에서 비디오 어플리케이션을 개발. WebRTC 서버
> - OpenVidu : ICE, 시그널링, 미디어 서버 같은 하위 수준 구현 래핑, 메세지 브로드캐스트, 화면공유 같은 기능을 포함한 코드제공. 화상회의 어플리케이션 개발 프레임워크
> - jit.si : Jitsi as a Service. api를 활용하여 app에 embed하여 meeting service를 제공

프론트엔드
> - Vue.js


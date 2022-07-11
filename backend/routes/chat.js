var express = require('express');
var router = express.Router();

var chat_client_controller = require('../controllers/chat_client_controller');

// async await 사용 안 할시 컨트롤러 서비스 사용불가 유의
router.get('/chat', async function(req, res, next) {
    var nowSessionUserData = req.session.user.data;

    if (nowSessionUserData.isdoctor == 'Y') {
        // 수의사 계정
        var chatList = await chat_client_controller.chatList(nowSessionUserData.userid);
        res.render('chat',{
            user: nowSessionUserData,
            activeChat: '',
            chatList: chatList
        });
    } else {
        //일반 계정
        var docList = await chat_client_controller.docList(req);
        console.log(docList);
        res.render('chat_client',{
            user: nowSessionUserData,
            docList: docList
        });
    }

});

router.get('/chat_create', async function(req, res, next) {

    var nowSessionUserData = req.session.user.data;

    var docId = req.query.userid;
    var loginedUserId = nowSessionUserData.userid;
    //채팅방 만들어져 있는지 확인
    var result = await chat_client_controller.beforeCreateCheck(docId, loginedUserId);
    console.log(result);
    if(typeof result == "undefined" || result == null || result == ""){
            //채팅방 생성 가능
            var responseCode = await chat_client_controller.createChat(docId, loginedUserId);
    
            console.log(responseCode);
            var chatList = await chat_client_controller.chatList(nowSessionUserData.userid);
            res.render('chat',{
                user: nowSessionUserData,
                activeChat: docId,
                chatList: chatList
            });
    }else{
            //채팅방 존재 (새로 생성 X)
            var chatList = await chat_client_controller.chatList(nowSessionUserData.userid);
            res.render('chat',{
                user: nowSessionUserData,
                activeChat: docId,
                chatList: chatList
            });
    }

});

router.post('/chat', async function(req, res){

    var loginedUser = req.session.user.data.userid;
    var result = await chat_client_controller.reFreshChat(req,loginedUser);
    //console.log(result);
    //req.session.user = result;
    //console.log(result);
    res.send(result);

});

router.post('/chatSend', async function(req, res){
    //userid, roomid, message INSERT

    var loginedUser = req.session.user.data.userid;
    var result = await chat_client_controller.chatSend(req,loginedUser);
    console.log(result);
    //req.session.user = result;
    //console.log(result);
    res.send(result);

});
// router.get('/chat_test2', async function(req, res, next) {

//     var result = await chat_client_controller.beforeCreateCheck("minji", "bong");

//     console.log(result);
//     if(typeof result == "undefined" || result == null || result == ""){
//             console.log(result + "--- 값 없음");
//         }else{
//             console.log(result + "--- 값 있음") ;
//     }

// });


module.exports = router;

var service_main = require("../services/chat_client_service");
exports.docList = async function(req){
    var result = await service_main.docList();
    return result;
};
exports.chatList = async function(loginedUserId){
    var result = await service_main.chatList(loginedUserId);
    return result;
};
exports.beforeCreateCheck = async function(toUser, fromUser){
    var result = await service_main.beforeCreateCheck(toUser, fromUser);
    return result;
};
exports.createChat = async function(toUser, fromUser){
    var responseCode = await service_main.createChat(toUser, fromUser);
    return responseCode;
};
exports.reFreshChat = async function(req, loginedUser){
    var result = await service_main.reFreshChat(req, loginedUser);
    return result;
};
exports.chatSend = async function(req, loginedUser){

    var result = await service_main.chatSend(req, loginedUser);
    return result;
};
var service_main = require("../services/info_service");

exports.InfoList = async function(req, uid){

    var result = await service_main.createInfoList(req, uid);
   
    return result;
};

exports.registPet = async function(req, uid){

    var result = await service_main.registPet(req, uid);
   
    return result;
};
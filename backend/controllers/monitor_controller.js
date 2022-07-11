var service_main = require("../services/monitor_service");

exports.SelectAtPet = async function(req,res){
    var result = await service_main.SelectAtPet(req);
    return result;
};
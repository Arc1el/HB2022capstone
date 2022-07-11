const config = require('../database/connect/config');
const pool = config;

exports.createInfoList = async function(req, uid){ 

    try {
        var conn = await pool.getConnection(); 
    } catch (error) {
        if(conn) conn.release();
    }
    var query = "SELECT * FROM pet WHERE userid = '"+uid+"';";

    try {
        var rows = await conn.query(query);
        return rows[0];
    } catch (error) {
    }
};

exports.registPet = async function(req,uidParam){ 
    var resultcode = 0; 
    var conn = await pool.getConnection();
    var petid = req.body.petid; 
    var deviceid = req.body.deviceid; 
    var uid = uidParam; 
    
    var query = "SELECT * FROM device where deviceid='" + deviceid +"' AND deviceisregisted = 'N';"; 
    try {
        var rows = await conn.query(query); 

    if(rows[0] !== undefined) { 
        // 존재하는 디바이스면 인서트문 실행
        var queryInsert = "INSERT INTO pet(petid, userid, deviceid) VALUES ('" + petid +"','" + uid +"','" + deviceid +"');"; 
        var queryUpdate = "UPDATE device SET deviceisregisted = 'Y' WHERE deviceid = '" + deviceid +"';"; 
        await conn.query(queryInsert);
        await conn.query(queryUpdate);

    } else { 
        // 존재하지 않는 디바이스
        resultcode = 100; 
    } 
    return resultcode; 
    } catch (error) {
        
    }
    
};

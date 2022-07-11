const config = require('../database/connect/config');
const pool = config;

exports.SelectAtPet = async function(req){ 
    try {
        var conn = await pool.getConnection(); 
    } catch (error) {
        if(conn) conn.release();
    }
    
    var query = "SELECT count(*) as 'count' FROM member;";

    try {
        var rows = await conn.query(query);
        // const totalCount = Number(rows[0].count);
        // var rows = await conn.query(query2);
        // const contentQueryResult = rows;
        // const result = {
        //     totalCount,
        //     contentQueryResult
        // };
        return result;
    } catch (error) {
    }
};
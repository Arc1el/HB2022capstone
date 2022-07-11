const config = require('../database/connect/config');
const pool = config;

exports.memList = async function(skipSize, contentSize){ 
    try {
        var conn = await pool.getConnection(); 
    } catch (error) {
        if(conn) conn.release();
    }
    
    var query1 = "SELECT count(*) as 'count' FROM member;";
    var query2 = 'SELECT * FROM member LIMIT '+skipSize+', '+contentSize+';';

    try {
        var rows = await conn.query(query1);
        const totalCount = Number(rows[0].count);
        var rows = await conn.query(query2);
        const contentQueryResult = rows;
        const result = {
            totalCount,
            contentQueryResult
        };
        return result;
    } catch (error) {
    }
};
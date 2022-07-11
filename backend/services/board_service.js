const config = require('../database/connect/config');
const pool = config;

exports.boardList = async function(skipSize, contentSize){ 
    try {
        var conn = await pool.getConnection(); 
    } catch (error) {
        if(conn) conn.release();
    }
    
    var query1 = "SELECT count(*) as 'count' FROM board;";
    var query2 = 'SELECT * FROM board LIMIT '+skipSize+', '+contentSize+';';

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

exports.createBoard = async function(req,res){ 
    var resultcode = 0; 
    var conn = await pool.getConnection();

    // get data
    var title = req.body.title; 
    var author = req.body.author; 
    var content = req.body.content; 
    
    var query = "SELECT title, author, content FROM member where title='" + title +"';"; 
    try {
        var rows = await conn.query(query); 

        // 쿼리 실행 
    if(rows[0] == undefined) { 
        var query = " insert into board (title, author, content, date) values ('" + title +"','" + author  +"','" + content +"', '"+ date +"', CURRENT_TIMESTAMP());";
        var rows = await conn.query(query); 
    } else { 
        // 이미 있음 
        resultcode = 100; 
    } 
    return resultcode; 
    } catch (error) {
        
    }
    
};

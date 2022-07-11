const maria = require('mariadb');


const pool = maria.createPool({
    "host":"localhost",
    "port":3306,
    "user":"root",
    "password":"root",
    "database":"testdb",
    "connectionLimit": 30
})

module.exports = pool;

// service에서 사용법 ---------

// const config = require('../database/connect/config');
// const pool = config;

// conn 객체 연결 오류시 conn release 해주기
// try {
//     var conn = await pool.getConnection(); 
// } catch (error) {
//     if(conn) conn.release();
// }

// service에서 사용법 ---------

/*https://t-anb.tistory.com/53
module.exports = (function () {
    let dbPool;
    const initiate = async () => {
        return await maria.createPool({
            "host":"localhost",
            "port":3306,
            "user":"root",
            "password":"root",
            "database":"testdb",
            "connectionLimit": 30
        })
    }
    return {
        getPool: async function () {
            if (!dbPool) {
                dbPool = await initiate();
                return dbPool
            }
            else return dbPool;
        }
    }
})();*/
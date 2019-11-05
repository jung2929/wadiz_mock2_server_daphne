const {pool} = require('../config/database');
const { logger } = require('../config/winston');

module.exports = { // 두 개의 메소드 module화
    query: async (...args) => {
        const queryText = args[0];
        const data = args[1];
       try {
            //var pool = await poolPromise;
            const connection = await pool.getConnection(async conn => conn);
            const result = await connection.query(queryText, data) || null;
            connection.release();
            logger.info(JSON.stringify(result[0]))
            return result[0];
        } catch (err) {
            logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
            return false;
        }
    },
    exampleNonTransaction: async function (sql, params) {
        try {

            console.log("ddddd" + pool)
            //const pool = await poolPromise;
            console.log("aaaaa" + pool)
            const connection = await pool.getConnection();
            try {
                const [rows] = await connection.query(sql, params);
                connection.release();
                console.log(rows)
                return rows;
            } catch (err) {
                logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
                connection.release();
                return false;
            }
        } catch (err) {
            logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
            return false;
        }
    }
};
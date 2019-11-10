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
        console.log(result[0])
            return result[0];
        } catch (err) {
            logger.error(`DB Connection error\n: ${JSON.stringify(err)}`);
            return false; //return 타입 수정
        } //finally
    },
    transaction : async (...args) => {
        const connection = await pool.getConnection();
    
        try {
            await connection.beginTransaction();
            await args[0](connection);
            await connection.commit();
        } catch (error) {
            console.log(error);
            await connection.rollback();
            logger.error(`App - Query error\n: ${JSON.stringify(err)}`);
        } finally {
            connection.release();
        }
    }
};
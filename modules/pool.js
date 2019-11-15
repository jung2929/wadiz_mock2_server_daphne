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
            await connection.release();
            logger.error(`App - Query error\n: ${JSON.stringify(err)}`);
        } finally {
            connection.release();
        }
    },



//     await connection.beginTransaction(); // START TRANSACTION
//     const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');

//     const insertUserInfoQuery = `
//         INSERT INTO UserInfo(email, pswd, nickname)
//         VALUES (?, ?, ?);
//             `;
//     const insertUserInfoParams = [email, hashedPassword, nickname];
//     await connection.query(insertUserInfoQuery, insertUserInfoParams);

//     await connection.commit(); // COMMIT
//     connection.release();
//     return res.json({
//         isSuccess: true,
//         code: 200,
//         message: "회원가입 성공"
//     });
// } catch (err) {
//     await connection.rollback(); // ROLLBACK
//     connection.release();
//     logger.error(`App - SignUp Query error\n: ${err.message}`);
//     return res.status(500).send(`Error: ${err.message}`);
// }

// Transaction: async(...args) => {
//     let result = "Success";
//     try {
//         var pool = await poolPromise;
//         var connection = await pool.getConnection();
//         await connection.beginTransaction();

//         await args[0](connection, ...args);
//         await connection.commit();
//     } catch (err) {
//         await connection.rollback();
//         console.log("mysql error! err log =>" + err);
//         result = undefined;
//     } finally {
//         pool.releaseConnection(connection);
//         return result;
//     }
// }
// const insertTransaction = await db.Transaction(async (connection) => {
//     await python(url);
//     const selectArticleIdx = 'SELECT article_idx FROM article ORDER BY article_idx DESC LIMIT 1';
//     const selectArticleIdxResult = await connection.query(selectArticleIdx);
// });




};
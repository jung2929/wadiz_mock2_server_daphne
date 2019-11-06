const db = require('../../../modules/pool');
const { logger } = require('../../../config/winston');

const utils = require('../../../modules/resModule')

/**
 create : 2019.11.05
 03.category API = 전체 카테고리 조회
 */
exports.getAllCategory = async function (req, res) {
    try {
        const selectCategoryQuery = `
                SELECT *
                FROM category;
                `;
        const categoryResult = await db.query(selectCategoryQuery);
        res.send(utils.successTrue(200, "카테고리조회 성공",categoryResult));
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}

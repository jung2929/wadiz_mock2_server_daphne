const db = require('../../../modules/pool');
const { logger } = require('../../../config/winston');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

const utils = require('../../../modules/resModule')
var urlencode = require('urlencode');

/**
 create : 2019.11.11
delivery API = 배송지 입력
이름, 폰번호, 주소
**/
exports.updateDelivery = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const name = req.body.name
    const phone = req.body.phone
    const address = req.body.address

    if(!name || !phone || !address) return res.send(utils.successFalse(301, "배송지 정보를 다 입력해주세요"))
    console.log(userIdx)

    const insertDeliveryQuery = `UPDATE wadiz.user SET name = ?, phone = ?, address = ? WHERE userIdx = ?;`
    try {
        const insertDeliveryResult = await db.query(insertDeliveryQuery, [name, phone, address, userIdx])
        if (!insertDeliveryResult) {
            res.send(utils.successFalse(600, "배송지 입력 실패"));
        } else {
            if (insertDeliveryResult.length == 0) {
                res.send(utils.successFalse(404, "해당 유저가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "배송지 입력 성공"));

        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
 create : 2019.11.11
delivery API = 배송지 조회

**/
exports.getDelivery = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    
    const getDeliveryQuery = `SELECT name, phone, address FROM wadiz.user WHERE userIdx = ?;`
    try {
        const getDeliveryResult = await db.query(getDeliveryQuery, [userIdx])
        if (!getDeliveryResult) {
            res.send(utils.successFalse(600, "배송지 조회 실패"));
        } else {
            if (getDeliveryResult[0].name == null || getDeliveryResult[0].phone == null || getDeliveryResult[0].address == null) {
                res.send(utils.successFalse(404, "이 유저의 등록된 정보가 없습니다."));
            } else res.send(utils.successTrue(200, "배송지 조회 성공", getDeliveryResult));

        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}
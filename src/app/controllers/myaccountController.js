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

    if (!name || !phone || !address) {

        console.log(userIdx)

        return res.send(utils.successFalse(301, "배송지 정보를 다 입력해주세요"))
    }

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

/**
 create : 2019.11.11
pay API = 결제정보 입력
카드번호
**/
exports.updatePay = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const card = req.body.card
    const birth = req.body.birth
    const insertPayQuery = `UPDATE wadiz.user SET card = ?, birth = ? WHERE userIdx = ?;`

    if(!card||!birth) return res.send(utils.successFalse(301, "결제정보를 입력해주세요"))
    //var pattern = /[0-9]{2}-[0-9]{2}/;
    if (birth.length == 7) return res.send(utils.successFalse(302, "형식을 맞춰서 입력해주세요"))

    try {
        const insertPayResult = await db.query(insertPayQuery, [card, birth, userIdx])
        if (!insertPayResult) {
            res.send(utils.successFalse(600, "결제정보 입력 실패"));
        } else {
            if (insertPayResult.length == 0) {
                res.send(utils.successFalse(404, "해당 유저가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "결제정보 입력 성공"));

        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
 create : 2019.11.11
pay API = 결제정보 조회
카드번호
**/
exports.getPay = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const getPayQuery = `SELECT CONCAT("**** **** **** ",RIGHT(card,4)) as card, CONCAT("등록일 : ",DATE_FORMAT(createdAt, '%Y.%m.%d')) as registration,
                        CASE WHEN LEFT(card,1) = '1' THEN "BC카드"
                        WHEN LEFT(card,1) = '2' THEN "삼성카드"
                        WHEN LEFT(card,1) = '3' THEN "신한카드"
                        WHEN LEFT(card,1) = '4' THEN "우리카드"
                        WHEN LEFT(card,1) = '5' THEN "롯데카드"
                        END as cardName
                        FROM wadiz.user WHERE userIdx = ?
                        `
    try {
        const getPayResult = await db.query(getPayQuery, [userIdx])
        if (!getPayResult) {
            res.send(utils.successFalse(600, "결제정보 조회 실패"));
        } else {
            if (getPayResult[0].card == null || getPayResult[0].cardName == null) {
                res.send(utils.successFalse(404, "이 유저의 등록된 정보가 없습니다"));
            } else res.send(utils.successTrue(200, "결제정보 조회 성공", getPayResult));

        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}
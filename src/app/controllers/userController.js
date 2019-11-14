const db = require('../../../modules/pool');
const { logger } = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../modules/resModule')

/**
 update : 2019.11.04
 01.signUp API = 회원가입
 */
exports.signup = async function (req, res) {
    const {
        email, name, pw, repw
    } = req.body;

    if (!email) return res.send(utils.successFalse(301, "이메일을 입력해주세요."));
    if (email.length > 30) return res.send(utils.successFalse(302, "이메일은 30자리 미만으로 입력해주세요."));
    if (!regexEmail.test(email)) return res.send(utils.successFalse(303, "이메일을 형식을 정확하게 입력해주세요."));
    if (!pw) return res.send(utils.successFalse(304, "비밀번호를 입력 해주세요"));
    if (pw.length < 2 || pw.length > 20) return res.send(utils.successFalse(305, "비밀번호는 8~20자리를 입력해주세요."));
    if (!name) return res.send(utils.successFalse(306, "이름을 입력 해주세요."));
    if (!repw) return res.send(utils.successFalse(307, "비밀번호를 한번 더 입력해주세요."));
    if (pw !== repw) return res.send(utils.successFalse(308, "비밀번호가 일치하지 않습니다."));

    try {
        console.log(email, name, pw)
        // 이메일 중복 확인
        const selectEmailQuery = `
                SELECT userIdx, userEmail, userName 
                FROM user 
                WHERE userEmail = ?;
                `;
        const selectEmailParams = [email];
        const emailRows = await db.query(selectEmailQuery, selectEmailParams);
        console.log(emailRows.length)
        if (emailRows.length >= 1) {
            res.send(utils.successFalse(309, "중복된 이메일입니다."));
        } else {
            const hashedPassword = await crypto.createHash('sha512').update(pw).digest('hex');
            const insertUserInfoQuery = `
                    INSERT INTO user(userEmail, userPw, userName)
                    VALUES (?, ?, ?);
                        `;
            const insertUserInfoParams = [email, hashedPassword, name];
            const signupaRow = await db.query(insertUserInfoQuery, insertUserInfoParams);
            res.send(utils.successTrue(201, "회원가입 성공"));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

};

/**
 update : 2019.11.05
 02.signIn API = 로그인
 **/
exports.signin = async function (req, res) {
    const {
        email, pw
    } = req.body;

    if (!email) return res.send(utils.successFalse(301, "이메일을 입력해주세요"));
    if (email.length > 30) return res.send(utils.successFalse(302, "이메일은 30자리 미만으로 입력해주세요."));
    if (!regexEmail.test(email)) return res.send(utils.successFalse(303, "이메일을 형식을 정확하게 입력해주세요."));
    if (!pw) return res.send(utils.successFalse(304, "비밀번호를 입력 해주세요."));

    try {
        const selectUserInfoQuery = `
                SELECT userIdx, userEmail , userPw, userName 
                FROM user 
                WHERE userEmail = ?;
                `;
        //let selectUserInfoParams = [email];

        const userInfoRows = await db.query(selectUserInfoQuery, email);
        if (userInfoRows.length == 1) {
            const hashedPassword = await crypto.createHash('sha512').update(pw).digest('hex');
            if (userInfoRows[0].userPw !== hashedPassword) {
                res.send(utils.successFalse(311, "비밀번호를 확인해주세요."));
            } else {
                //토큰 생성
                let token = await jwt.sign({
                    id: userInfoRows[0].userIdx,
                    //email: email
                    // password: hashedPassword,
                    // nickname: userInfoRows[0].nickname,
                }, // 토큰의 내용(payload)
                    secret_config.jwtsecret, // 비밀 키
                    {
                        expiresIn: '365d',
                        subject: 'userInfo',
                    } // 유효 시간은 365일
                );
                res.send(utils.successTrue(200, "로그인 성공", token));
            }
        } else {
            return res.send(utils.successFalse(310, "아이디를 확인해주세요."));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/**
 update : 2019.11.10
 getProfile API = 마이페이지 조회
 이름 개인회원 프로필이미지 관심사(5개)
 **/
exports.getProfile = async function (req, res) {

    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id

    const getProfileQuery = `SELECT userName, profileImg FROM wadiz.user WHERE userIdx = ?`
    const getInteret = `SELECT c.category FROM wadiz.category c, wadiz.categoryInterest i WHERE c.categoryIdx = i.categoryIdx AND i.userIdx = ?`

    const getProfileR = await db.query(getProfileQuery, userIdx)
    const getInterestR = await db.query(getInteret, userIdx)
    const getProfileResult = {
        "userName": getProfileR[0].userName,
        "profileImg": getProfileR[0].profileImg,
        "interestList": getInterestR
    }
    try {
        if (!getProfileResult) {
            res.send(utils.successFalse(600, "마이페이지 조회실패"));
        } else {
            if (getProfileResult.length == 0) {
                res.send(utils.successFalse(404, "해당 유저가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "마이페이지 조회성공", getProfileResult));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/**
 update : 2019.11.10
 getProfile API = 마이페이지 마이리워드 조회
 
 **/
exports.getProfileMyReward = async function (req, res) {

    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id

    const getMyReward = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                            CONCAT(ROUND((ar.amount / p.goal) * 100),"%") as achievement,
                            CONCAT(FORMAT(ar.amount,0),"원") AS amount, 
                            CONCAT(TIMESTAMPDIFF(DAY, p.startDate, CURRENT_TIMESTAMP), "일 남음") AS remaining
                            FROM wadiz.project AS p 
                            LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                            LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                            LEFT JOIN (
                                SELECT r.projectIdx, 
                                SUM(r.rewardPrice) AS amount 
                                FROM wadiz.account AS a
                                LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                                LEFT JOIN wadiz.account a ON p.projectIdx = a.projectIdx
                                WHERE a.userIdx = ? AND p.projectIdx = a.projectIdx`
    const getMyrewardR = await db.query(getMyReward, userIdx)
    try {
        if (!getMyrewardR) {
            res.send(utils.successFalse(600, "마이리워드 조회실패"));
        } else {
            if (getMyrewardR.length == 0) {
                res.send(utils.successFalse(404, "해당 유저가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "마이 리워드 조회성공", getMyrewardR));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}

/**
 update : 2019.11.13
 getProfile API = 마이페이지 좋아한 리워드 조회
 
 **/
exports.getProfileMyLike = async function (req, res) {

    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id

    const getLikeReward = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                            CONCAT(ROUND((ar.amount / p.goal) * 100),"%") as achievement,
                            CONCAT(FORMAT(ar.amount,0),"원") AS amount, 
                            CONCAT(TIMESTAMPDIFF(DAY, p.startDate, CURRENT_TIMESTAMP), "일 남음") AS remaining
                            FROM wadiz.project AS p 
                            LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                            LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                            LEFT JOIN (
                                SELECT r.projectIdx, 
                                SUM(r.rewardPrice) AS amount 
                                FROM wadiz.account AS a
                                LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                                LEFT JOIN wadiz.like l ON p.projectIdx = l.userIdx
                                WHERE l.userIdx = ? AND p.projectIdx = l.projectIdx`

    const getLikeRewardR = await db.query(getLikeReward, userIdx)

    try {
        if (!getLikeRewardR) {
            res.send(utils.successFalse(600, "좋아한 리워드 조회실패"));
        } else {
            if (getLikeRewardR.length == 0) {
                res.send(utils.successFalse(404, "해당 유저가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "좋아한 리워드 조회성공", getLikeRewardR));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}


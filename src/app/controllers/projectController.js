const db = require('../../../modules/pool');
const { logger } = require('../../../config/winston');
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

const utils = require('../../../modules/resModule')
var urlencode = require('urlencode');

/**
 create : 2019.11.05
 05.project API = 전체 프로젝트 조회
 - 추천순 :  관리자가 추천하는 것
 - 인기순 : 모금액순
 - 펀딩순 : 달성률순
 - 마감임박순 : 일수 오름차순
 - 최신순 : 등록일자순
 - 응원참여자수 : 서포터스수
 - 오픈예정 : 
 */
// 사진 타이틀 카테고리 메이커이름 달성률 모은금액 남은일수
exports.getProject = async function (req, res) {
    //쿼리빌더 ORM 
    const orderby = req.query.orderby;
    console.log(orderby)
    const selectRecoQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                            IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                            IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                            CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                            FROM wadiz.project AS p 
                            LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                            LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                            LEFT JOIN (
                                SELECT r.projectIdx, 
                                SUM(r.rewardPrice * a.quantity) AS amount 
                                FROM wadiz.account AS a
                                LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                            WHERE p.star = 0;`
    const selectFamousQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                FROM wadiz.project AS p
                                LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                                LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                LEFT JOIN (
                                    SELECT r.projectIdx, 
                                    SUM(r.rewardPrice * a.quantity) AS amount 
                                    FROM wadiz.account AS a
                                    LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                    GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                                    LEFT JOIN ( 
                                        SELECT COUNT(l.userIdx) as famous, 
                                        l.projectIdx  
                                        FROM wadiz.like l
                                        LEFT JOIN wadiz.user u ON l.userIdx = u.userIdx 
                                        GROUP BY l.projectIdx) as lt ON lt.projectIdx = p.projectIdx
                                        ORDER BY famous DESC;`  //인기순 조회

    const selectFundingQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                FROM wadiz.project AS p
                                LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                                LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                LEFT JOIN (
                                    SELECT r.projectIdx, 
                                    SUM(r.rewardPrice * a.quantity) AS amount 
                                    FROM wadiz.account AS a
                                    LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                    GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                                    ORDER BY achievement DESC;`; //펀딩순

    const selectDeadlineQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                FROM wadiz.project AS p
                                LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx 
                                LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                LEFT JOIN (
                                    SELECT r.projectIdx, 
                                    SUM(r.rewardPrice * a.quantity) AS amount 
                                    FROM wadiz.account AS a
                                    LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                    GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx 
                                    ORDER BY remaining ASC;`; //마감임박순
    const selectNewQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                    IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                    IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                    CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                    FROM wadiz.project AS p
                                    LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx 
                                    LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                    LEFT JOIN (
                                        SELECT r.projectIdx, 
                                        SUM(r.rewardPrice * a.quantity) AS amount 
                                        FROM wadiz.account AS a
                                        LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                        GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx 
                                        ORDER BY p.createdAt`; //최신순
    const selectSupporterQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                        IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                        IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                        CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                        FROM wadiz.project AS p
                                        LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx 
                                        LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                        LEFT JOIN (
                                            SELECT r.projectIdx, 
                                            SUM(r.rewardPrice * a.quantity) AS amount 
                                            FROM wadiz.account AS a
                                            LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                            GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx 
                                            LEFT JOIN (
                                            SELECT projectIdx, count(projectIdx) as sc
                                            FROM wadiz.account 
                                            GROUP BY projectIdx) as ac ON ac.projectIdx = p.projectIdx 
                                            ORDER BY sc`; //응원참여자순
    try {
        if (orderby === "recommend") {
            const projectResult = await db.query(selectRecoQuery);
            res.send(utils.successTrue(200, "추천순 프로젝트 조회 성공", projectResult));
        } else if (orderby == "famous") {
            const projectResult = await db.query(selectFamousQuery);
            res.send(utils.successTrue(200, "인기순 프로젝트 조회 성공", projectResult));
        } else if (orderby == "funding") {
            const projectResult = await db.query(selectFundingQuery);
            res.send(utils.successTrue(200, "펀딩순 프로젝트 조회 성공", projectResult));
        } else if (orderby == "deadline") {
            const projectResult = await db.query(selectDeadlineQuery);
            res.send(utils.successTrue(200, "마감임박순 프로젝트 조회 성공", projectResult));
        } else if (orderby == "newp") {
            const projectResult = await db.query(selectNewQuery);
            res.send(utils.successTrue(200, "최신순 프로젝트 조회 성공", projectResult));
        } else if (orderby == "supporter") {
            const projectResult = await db.query(selectSupporterQuery);
            res.send(utils.successTrue(200, "응원 참여자순 프로젝트 조회 성공", projectResult));
        } else if (orderby == "doing") {
            const projectResult = await db.query(selectFamousQuery);
            res.send(utils.successTrue(200, "진행 중 프로젝트 조회 성공", projectResult));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
 create : 2019.11.14
 unopend API = 오픈예정 프로젝트 조회
 */
exports.getUnopenedProject = async function (req, res) {

    const unopendQuery = `SELECT p.projectIdx, p.thumnail, p.title, m.makerName, TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP, p.startDate) as ts, 
                            "11월중 오픈예정" as expected
                            FROM wadiz.project AS p
                            JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                            WHERE TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP, p.startDate) > 0; `
    try {
        const unopendResult = await db.query(unopendQuery);
        if (unopendResult.length == 0) {
            res.send(utils.successFalse(404, "오픈예정중인 프로젝트가 없습니다"));
        } else res.send(utils.successTrue(200, "오픈예정 프로젝트 조회 성공", unopendResult));

    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}
/**
 create : 2019.11.12
 category API = 카테고리별 프로젝트 조회
 */
exports.getCategoryProject = async function (req, res) {
    const categoryIdx = req.params.categoryIdx
    if (categoryIdx < 0 || categoryIdx > 9) return res.send(utils.successFalse(301, "해당 카테고리가 존재하지 않습니다."));
    try {
        if (categoryIdx == 0) {
            const categoryProjectQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                        IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                        IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                        CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                        ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                        FROM wadiz.project AS p
                                        LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                                        LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                        LEFT JOIN (
                                            SELECT r.projectIdx, 
                                            SUM(r.rewardPrice * a.quantity) AS amount 
                                            FROM wadiz.account AS a
                                            LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                            GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx;`
            const categoryProjectResult = await db.query(categoryProjectQuery);
            return res.send(utils.successTrue(200, "전체 카테고리 프로젝트 성공", categoryProjectResult));
        } else {
            const categoryProjectQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                                        IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                                        IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                                        CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                        ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                                        FROM wadiz.project AS p
                                        LEFT JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                                        LEFT JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                                        LEFT JOIN (
                                            SELECT r.projectIdx, 
                                            SUM(r.rewardPrice * a.quantity) AS amount 
                                            FROM wadiz.account AS a
                                            LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                                            GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                                            WHERE p.categoryIdx = ?;`
            const categoryProjectResult = await db.query(categoryProjectQuery, [categoryIdx]);
            console.log(categoryProjectResult)
            if (categoryProjectResult.length == 0) {
                res.send(utils.successFalse(404, "검색결과 없습니다."));
            } else res.send(utils.successTrue(200, "카테고리별 프로젝트 성공", categoryProjectResult));
        }

    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/** create : 2019.11.12
 get supporter API = 프로젝트 서포터 조회
 총서포터명수 프로필 이미지 누가(익명인지) 얼마(비공개인지) 펀딩했습니다
 **/
//서포터가 같으면 금액에 합쳐야하는데 합치지 말자^^!
exports.getSupporter = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const projectIdx = req.params.projectIdx
    const selectSupporterQuery = `SELECT u.userIdx, u.profileImg, 
                                    (CASE WHEN a.veilName = 0 THEN u.userName
                                    WHEN a.veilName = 1 THEN "익명의" END) as veilName,
                                    FORMAT(SUM(a.price * a.quantity),0) as veilPrice
                                    FROM wadiz.user u 
                                    INNER JOIN wadiz.account a 
                                    ON u.userIdx = a.userIdx
                                    WHERE a.projectIdx = ?
                                    GROUP BY u.userIdx, u.profileImg, veilName;`
    const selectSupporterR = await db.query(selectSupporterQuery, [projectIdx])
    const projectSupportResult = {
        supportResult: selectSupporterR,
        cnt: selectSupporterR.length
    };
    try {
        if (selectSupporterR.length == 0) {
            res.send(utils.successFalse(404, "이 프로젝트에 서포터가 없습니다."));
        } else {
            res.send(utils.successTrue(200, "서포터 조회 성공", projectSupportResult));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/** create : 2019.11.10
 05.project API = 프로젝트 검색
 **/
exports.searchProject = async function (req, res) {
    const word = req.query.word
    const searchQuery = `SELECT p.projectIdx, p.thumnail, p.title, c.category, m.makerName, 
                        IFNULL(CONCAT(ROUND((ar.amount / p.goal) * 100),"%"),"0%") as achievement,
                        IFNULL(CONCAT(FORMAT(ar.amount,0),"원"),"0원") AS amount, 
                        CASE WHEN TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate) < 0 THEN "종료"
                                ELSE CONCAT(TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP,p.endDate), "일 남음") END AS remaining
                        FROM wadiz.project AS p
                        INNER JOIN wadiz.category AS c ON p.categoryIdx = c.categoryIdx
                        INNER JOIN wadiz.maker AS m ON p.projectIdx = m.projectIdx
                        LEFT JOIN (
                            SELECT r.projectIdx, 
                            SUM(r.rewardPrice * a.quantity) AS amount 
                            FROM wadiz.account AS a
                            LEFT JOIN wadiz.reward AS r ON a.rewardIdx = r.rewardIdx 
                            GROUP BY r.projectIdx) AS ar ON ar.projectIdx = p.projectIdx
                        WHERE p.title LIKE ?;`

    const decodeKeyword = urlencode.decode(word)

    const searchWordResult = await db.query(searchQuery, ['%' + decodeKeyword + '%']);
    console.log(searchWordResult.length)
    const projectCntResult = {
        projectResult: searchWordResult,
        cnt: searchWordResult.length
    };
    try {
        if (searchWordResult.length == 0) {
            res.send(utils.successFalse(404, "검색결과 없습니다."));
        } else {
            res.send(utils.successTrue(200, "검색성공", projectCntResult));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}

/** create : 2019.11.10
 05.project API = 프로젝트 상세정보 조회
 사진 타이틀 카테고리 설명 남은일수 달성률 총펀딩금액 서포터명수 //0명
 **/
exports.getBasicProject = async function (req, res) {
    const projectIdx = req.params.projectIdx
    const getBasicQuery = `SELECT p.thumnail, p.title, c.category, p.infoText, 
                            CONCAT(FORMAT(p.goal,0),"원") as goal, CONCAT(LEFT(p.startDate,11),"~ ",LEFT(p.endDate,11)) as term,
                            IFNULL(CONCAT(sc.supporterCnt,"명"),"0명") as supprterCnt, 
                            m.makerName, m.makerImg, m.facebook, m.instagram,
                            p.projectStory
                            FROM wadiz.project p 
                            LEFT JOIN wadiz.category c ON p.categoryIdx = c.categoryIdx
                            LEFT JOIN wadiz.maker m ON p.projectIdx = m.projectIdx
                            LEFT JOIN (SELECT count(1) as supporterCnt, a.projectIdx  FROM wadiz.account a WHERE a.projectIdx = ?) as sc ON p.projectIdx = sc.projectIdx
                            WHERE p.projectIdx = ?`
    const getBasicResult = await db.query(getBasicQuery, [projectIdx,projectIdx])
    try {
        if (!getBasicResult) {
            res.send(utils.successFalse(600, "프로젝트 상세정보 조회실패"));
        } else {
            if (getBasicResult.length == 0) {
                res.send(utils.successFalse(404, "해당프로젝트가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "프로젝트 상세정보 조회성공", getBasicResult[0]));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

}
/** create : 2019.11.14
 unopendDetail API = 오픈예정 프로젝트 상세 조회
 **/
exports.getUnopenedDetail = async function (req, res) {

    const projectIdx = req.params.projectIdx
    const getUnopendQuery = `SELECT p.thumnail, p.title, p.infoText, CONCAT("메이커 : ",m.makerName) as makerName, m.makerImg,
                            p.projectStory,
                            "11월 중 오픈예정" as expected
                            FROM wadiz.project p 
                            JOIN wadiz.maker m ON p.projectIdx = m.projectIdx
                            WHERE p.projectIdx = ? AND TIMESTAMPDIFF(DAY,CURRENT_TIMESTAMP, p.startDate) > 0`
    const getUnopendResult = await db.query(getUnopendQuery, [projectIdx])
    try {
        if (!getUnopendResult) {
            res.send(utils.successFalse(600, "오픈예정 프로젝트 상세정보 조회실패"));
        } else {
            if (getUnopendResult.length == 0) {
                res.send(utils.successFalse(404, "해당 프로젝트가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "오픈예정 상세정보 조회성공", getUnopendResult[0]));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/** create : 2019.11.10
 05.project API = 프로젝트 리워드 조회
 금액 이름 설명 배송비 발송시작일 제한수량 남은재고 완료펀딩개수
 **/
exports.getRewardProject = async function (req, res) {
    const projectIdx = req.params.projectIdx
    const getRewardQuery = `SELECT r.rewardIdx, CONCAT(FORMAT(r.rewardPrice,0),"원 펀딩") as rewardPrice, r.rewardName, r.rewardInfo, r.shipping, CONCAT("제한수량 ",FORMAT(r.quantity,0),"개") as quantity,
                            CONCAT("현재 ",FORMAT(r.quantity - (SELECT count(a.rewardIdx) FROM wadiz.account a WHERE r.rewardIdx = a.rewardIdx),0),"개 남음!") as remaining,
                            CONCAT("총 ",FORMAT((SELECT count(a.rewardIdx) FROM wadiz.account a WHERE r.rewardIdx = a.rewardIdx ),0),"개 펀딩완료") as completion
                            FROM wadiz.reward r
                            WHERE r.projectIdx = ?;`

    const getRewardResult = await db.query(getRewardQuery, [projectIdx])
    try {
        if (!getRewardResult) {
            res.send(utils.successFalse(600, "리워드 조회실패"));
        } else {
            if (getRewardResult.length == 0) {
                res.send(utils.successFalse(404, "해당 리워드가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "리워드 조회성공", getRewardResult));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/** create : 2019.11.10
 05.project API = 프로젝트 정책 조회
 메이커이름 rewardDate, deliveryDate
 **/
exports.getPolicy = async function (req, res) {
    const projectIdx = req.params.projectIdx
    const getPolicyQuery = `SELECT m.makerName, p.rewardDate, p.deliveryDate FROM wadiz.maker m, wadiz.project p WHERE p.projectIdx = m.projectIdx AND p.projectIdx = ?;`

    const getPolicyResult = await db.query(getPolicyQuery, [projectIdx])
    try {
        if (!getPolicyResult) {
            res.send(utils.successFalse(600, "정책 조회실패"));
        } else {
            if (getPolicyResult.length == 0) {
                res.send(utils.successFalse(404, "해당 프로젝트가 존재하지 않습니다."));
            } else res.send(utils.successTrue(200, "정책 조회성공", getPolicyResult[0]));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/** create : 2019.11.15
 postReward API = 리워드 선택 
리워드수량 익명이름 익명금액 삽입
 **/
exports.postReward = async function (req, res) {
    const projectIdx = req.params.projectIdx
    const rewardList = req.body.rewardList
    const veilName = req.body.veilName
    const veilPrice = req.body.veilPrice
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const insertRewardQuery = `INSERT INTO wadiz.account (userIdx, projectIdx, rewardIdx, price, quantity, veilName, veilPrice) VALUES (?, ?, ?, ?, ?, ?, ?);`


    const rewardIdxCheck = `SELECT projectIdx FROM `
    console.log(userIdx)
    console.log(rewardList.length)
    //map lamda transaction (table lock)
    try {
        for (var i = 0; i < rewardList.length; i++) {
            if (!rewardList[i].rewardIdx) return res.send(utils.successFalse(301, "리워드를 선택해주세요"))
            if (!rewardList[i].quantity) return res.send(utils.successFalse(303, "수량을 선택해주세요"))
            const getRewardPrice = await db.query(`SELECT rewardPrice FROM wadiz.reward WHERE rewardIdx = ?`, [rewardList[i].rewardIdx])
            const checkQuery = await db.query(`SELECT userIdx FROM wadiz.account WHERE userIdx = ? AND projectIdx = ? AND rewardIdx = ? AND quantity =? `, [userIdx, projectIdx, rewardList[i].rewardIdx, rewardList[i].quantity])
            if (checkQuery.length > 0) {
                return res.send(utils.successFalse(304, "이미 해당 리워드를 선택하였습니다."));
            } else {
                const insertRewardResult = await db.query(insertRewardQuery, [userIdx, projectIdx, rewardList[i].rewardIdx, getRewardPrice[i].rewardPrice, rewardList[i].quantity, veilName, veilPrice])
                if (!insertRewardResult) { //or and
                    return res.send(utils.successFalse(600, "리워드 선택 실패"));
                } else {
                    if (insertRewardResult.length == 0) {
                        return res.send(utils.successFalse(404, "해당 프로젝트가 존재하지 않습니다."));
                    } else return res.send(utils.successTrue(200, "리워드 선택 성공"));
                }
            }
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/** create : 2019.11.15
 delReward API = 프로젝트 리워드 취소
 **/
exports.delReward = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const projectIdx = req.params.projectIdx
    const getProjectResult = await db.query(`SELECT * FROM wadiz.account WHERE userIdx = ? AND projectIdx = ? `, [userIdx, projectIdx])

    try {
        if (getProjectResult.length == 0) {
            return res.send(utils.successTrue(404, "해당 프로젝트를 펀딩한 내역이 없습니다."));
        } else {
            const delMyReward = await db.query(`DELETE FROM wadiz.account WHERE userIdx = ? AND projectIdx = ? `, [userIdx, projectIdx])
            return res.send(utils.successTrue(200, "결제 예약 취소 성공"));
        }

    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/** create : 2019.11.16
 likeProject API = 프로젝트 좋아요/좋아요취소
 **/
exports.likeProject = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const projectIdx = req.params.projectIdx
    const likeCheck = await db.query(`SELECT userIdx FROM wadiz.like WHERE userIdx = ? AND projectIdx = ? `, [userIdx, projectIdx])

    try {
        if (likeCheck.length == 1) {
            const delLikeProject = await db.query(`DELETE FROM wadiz.like WHERE userIdx = ? AND projectIdx = ?`, [userIdx, projectIdx])
            return res.send(utils.successTrue(201, "프로젝트 좋아요 취소"));
        } else {
            const addLikeProject = await db.query(`INSERT INTO wadiz.like (userIdx, projectIdx) VALUES (?, ?) `, [userIdx, projectIdx])
            return res.send(utils.successTrue(200, "프로젝트 좋아요"));
        }
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/** create : 2019.11.16
 likeProject API = 프로젝트 좋아요 여부/ 좋아요 개수
 **/
exports.likeInfoProject = async function (req, res) {
    let decode = await jwt.verify(req.headers.token, secret_config.jwtsecret)
    const userIdx = decode.id
    const projectIdx = req.params.projectIdx
    const likeCntQuery = `SELECT count(likeIdx) as likeCnt
                            FROM wadiz.like 
                            WHERE projectIdx = ? `
    const islikeQuery = `SELECT
                        p.projectIdx, (wl.likeIdx IS NOT NULL) as isLike
                        FROM (SELECT * FROM wadiz.like l WHERE l.userIdx = ? AND l.projectIdx = ?) wl
                        RIGHT JOIN wadiz.project p ON wl.projectIdx = p.projectIdx
                        `
    try {
        const likeCntResult = await db.query(likeCntQuery,[projectIdx])
        const isLikeResult = await db.query(islikeQuery,[userIdx, projectIdx])

        const likeInfo = {
            "likeCnt" : likeCntResult[0].likeCnt,
            "isLike" : isLikeResult[0].isLike
        }
        return res.send(utils.successTrue(200, "프로젝트 좋아요 개수/ 여부 성공",likeInfo));        
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
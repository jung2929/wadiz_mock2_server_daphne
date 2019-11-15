module.exports = function (app) {
    const account = require('../controllers/myaccountController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    app.route('/delivery').put(jwtMiddleware, account.updateDelivery);
    app.get('/delivery', jwtMiddleware, account.getDelivery);
    app.route('/pay').put(jwtMiddleware, account.updatePay);
    app.get('/pay', jwtMiddleware, account.getPay);
    app.route('/pay').delete(jwtMiddleware, account.deletePay);
}
module.exports = function (app) {
    const delivery = require('../controllers/deliveryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    app.route('/delivery').put(jwtMiddleware, delivery.updateDelivery);
}
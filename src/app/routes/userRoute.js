module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/signup').post(user.signup);
    app.route('/signin').post(user.signin);

    app.get('/profile', jwtMiddleware, user.getProfile);
    app.get('/profile/reward', jwtMiddleware, user.getProfileMyReward);
    app.get('/profile/like', jwtMiddleware, user.getProfileMyLike);

};
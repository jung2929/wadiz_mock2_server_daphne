module.exports = function(app){
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    
    app.get('/check', jwtMiddleware, user.check);
    app.get('/category').post(category.getCategory);

   
};
module.exports = function(app){
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/category', jwtMiddleware, category.getAllCategory);
    app.get('/category',category.getAllCategory);

    // app.get('/category/:categoryIdx', jwtMiddleware, category.getCategory);
    // app.get('/category/:categoryIdx',category.getCategory);

   
};
module.exports = function(app){
    const project = require('../controllers/projectController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.route('/project').post(jwtMiddleware, project.getProject);
    app.route('/project/search').post(jwtMiddleware, project.searchProject);
    app.get('/project/:projectIdx/basic', jwtMiddleware, project.getBasicProject);
    app.get('/project/:projectIdx/reward', jwtMiddleware, project.getRewardProject); 
    app.get('/project/:projectIdx/policy', jwtMiddleware, project.getPolicy);
    // app.get('/project/deadline',project.getDeadlineProject);
    // app.get('/project/new',project.getNewProject);
    // app.get('/project/suporter',project.getSuporterProject);
};
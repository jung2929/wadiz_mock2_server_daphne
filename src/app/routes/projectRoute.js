module.exports = function(app){
    const project = require('../controllers/projectController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.route('/project').post(jwtMiddleware, project.getProject);
    app.route('/project/search').post(jwtMiddleware, project.searchProject);
    app.get('/project/:projectIdx/basic', jwtMiddleware, project.getBasicProject);
    app.get('/project/:projectIdx/reward', jwtMiddleware, project.getRewardProject); 
    app.get('/project/:projectIdx/policy', jwtMiddleware, project.getPolicy);
    app.route('/project/:projectIdx/reward/:rewardIdx').post(jwtMiddleware, project.postReward);
  
    
  
};
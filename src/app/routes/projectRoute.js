module.exports = function(app){
    const project = require('../controllers/projectController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.get('/project', project.getProject);
    app.get('/project/search',project.searchProject);
    app.get('/project/:categoryIdx',project.getCategoryProject);
    app.get('/project/{projectIdx}/supporter',project.getSupporter);
    app.get('/project/:projectIdx/basic', jwtMiddleware, project.getBasicProject);
    app.get('/project/:projectIdx/reward', jwtMiddleware, project.getRewardProject); 
    app.get('/project/:projectIdx/policy', jwtMiddleware, project.getPolicy);
    app.route('/project/:projectIdx/reward/:rewardIdx').post(jwtMiddleware, project.postReward);
  
    
  
};
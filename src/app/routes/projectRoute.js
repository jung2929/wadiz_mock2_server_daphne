module.exports = function(app){
    const project = require('../controllers/projectController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.get('/project', project.getProject);
    app.get('/project/unopened', project.getUnopenedProject);
    app.get('/project/search',project.searchProject);
    app.get('/project/:categoryIdx',project.getCategoryProject);
    app.get('/project/:projectIdx/supporter',project.getSupporter);
    app.get('/project/:projectIdx/basic', jwtMiddleware, project.getBasicProject);
    app.get('/project/:projectIdx/unopened', jwtMiddleware, project.getUnopenedDetail);
    app.get('/project/:projectIdx/reward', jwtMiddleware, project.getRewardProject); 
    app.get('/project/:projectIdx/policy', jwtMiddleware, project.getPolicy);
    app.route('/project/:projectIdx/reward').post(jwtMiddleware, project.postReward);
    app.route('/project/:projectIdx').delete(jwtMiddleware, project.delReward);
    app.route('/project/:projectIdx/like').post(jwtMiddleware, project.likeProject);
    app.get('/project/:projectIdx/isLiked',jwtMiddleware, project.likeInfoProject);
  
    
  
};
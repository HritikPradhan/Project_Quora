const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')
const middleware = require('../middlewares/middleware')

//User
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile',middleware.Authentication,userController.getUser);
router.put('/user/:userId/profile',middleware.Authentication,userController.updateUser);

//Question
 router.post('/question',middleware.Authentication,questionController.postquestion);
 router.get('/question',questionController.getquestion);
 router.get('/question/:questionId',questionController.getquestionbyid);
 router.put('/question/:questionId',middleware.Authentication,questionController.updatequestionbyid);
 router.delete('/question/:questionId',middleware.Authentication,questionController.deletequestionbyid);

 //Answer
 router.post('/answer',middleware.Authentication,answerController.postanswer);
 router.get('/questions/:questionId/answer',answerController.getanswer);
 router.put('/answer/:answerId',middleware.Authentication,answerController.updateanswer)
 router.delete('/answer/:answerId',middleware.Authentication,answerController.deleteanswer)






module.exports = router;
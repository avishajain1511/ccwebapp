const express=require('express');
const router = express.Router();

const app_controller = require('../controllers/app.controller');

// routes for creating, updating and getting user information
router.post('/user', app_controller.register);
router.get('/user/self' , app_controller.login);
router.put('/user/self', app_controller.update);
    
    

module.exports=router;


const express=require('express');
const router = express.Router();

const app_controller = require('../controllers/app.controller');

// routes for creating, updating and getting user information

router.post('/user', app_controller.register);
router.get('/user/self' , app_controller.login);
router.put('/user/self', app_controller.update);
router.post('/user/recipie',recipie_controller.registerRecipe)    
router.get('/user/recipie/:id',recipie_controller.getRecipe)    
router.delete('/user/recipie/:id',recipie_controller.deleteRecipe)    
router.put('/user/recipie/:id',recipie_controller.updateRecipe)     
    

module.exports=router;


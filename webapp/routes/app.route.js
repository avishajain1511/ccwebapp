const express=require('express');
const router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'uploads/',errorHandling: 'manual' })
multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const app_controller = require('../controllers/app.controller');
const recipie_controller = require('../controllers/app.recipe_contoller');
const recipeImage_controller=require('../controllers/app.imageController')

router.post('/user', app_controller.register);
router.get('/user/self' , app_controller.login);
router.put('/user/self', app_controller.update);
router.post('/recipe',recipie_controller.registerRecipe)    
router.get('/recipe/:id',recipie_controller.getRecipe)    
router.post('/myrecipes',recipie_controller.myRecipeFunction)    
router.get('/recipes',recipie_controller.recipes)    
router.delete('/recipe/:id',recipie_controller.deleteRecipe)    
router.put('/recipe/:id',recipie_controller.updateRecipe)     
    
router.post('/recipe/:recipeId/image', upload.single('imageUpload'), function (err, req, res, next) {
    console.error(err.stack)
    res.status(400).send({meesage:'Bad Request ,Formdata is not correct! use imageUpload as key'})
  }
  ,recipeImage_controller.addRecipeImage)
router.get('/recipe/:recipeId/image/:imageId',recipeImage_controller.getRecipeImage)
router.delete('/recipe/:recipeId/image/:imageId',recipeImage_controller.deleteRecipeImage)

router.get('/check', function (req, res, next) {
  res.status(200).json({
      "message": "Check Successful"
  });
});

module.exports=router;


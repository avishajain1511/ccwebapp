var bcrypt = require('bcrypt');
var mysql = require('mysql');
var connection = require('../models/app.model');
const uuidv1 = require('uuid/v1');
const aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
var fs = require('fs');
var Client = require('node-statsd-client').Client;
const logger = require('../config/winston');
var client = new Client("localhost", 8125);
var sns = new aws.SNS({});
var s3 = new aws.S3();
var registerCounter=0;
var updateCounter=0;
var getCounter=0;
exports.registerRecipe = function (req, res) {
  logger.info("register recipe");
  var start = new Date();

  registerCounter=registerCounter+1;
  client.count("count register recipe api", 1);

  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ message: 'No authorization token' });

 

  if ((req.body.cook_time_in_min) == null || req.body.prep_time_in_min == null || (req.body.title) == null || (req.body.title).trim().length < 1 || (req.body.cusine).trim().length < 1 || (req.body.cusine) == null || req.body.servings == null
    || req.body.ingredients == null || req.body.ingredients.length < 1 || req.body.steps == null || req.body.steps.length < 1
    || req.body.nutrition_information == null || Object.keys(req.body.nutrition_information).length < 1
    || req.body.nutrition_information.protein_in_grams == null || req.body.nutrition_information.calories == null || req.body.nutrition_information.cholesterol_in_mg == null
    || req.body.nutrition_information.sodium_in_mg == null || req.body.nutrition_information.carbohydrates_in_grams == null) {

    return res.status(400).send({
      message: 'Bad Request, Feilds Cannot be null or Empty'
    })
  };

  function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  function isInteger1(value) {
    return !isNaN(value) && parseInt(value) == value && !isNaN(parseInt(value, 10)) && !(typeof value === 'string');
  }

  if (!isNumber(req.body.nutrition_information.protein_in_grams) || !isNumber(req.body.nutrition_information.cholesterol_in_mg) ||
    !isNumber(req.body.nutrition_information.carbohydrates_in_grams) || !isInteger1(req.body.nutrition_information.calories) ||
    !isInteger1(req.body.nutrition_information.sodium_in_mg)) {
    return res.status(400).send({
      message: 'Bad Request, Invalid nutrition_information.'
    })
  }
  if (!(req.body.servings >= 1 && req.body.servings <= 5)) {
    return res.status(400).send({
      message: 'Bad Request, Valid Servings are from 1 to 5'
    })
  }
  if (req.body.cook_time_in_min % 5 != 0 || req.body.prep_time_in_min % 5 != 0) { return res.status(400).send({ message: 'Bad Request, Time should be in multiple of 5' }) };

 // console.log((req.body.nutrition_information).length);
 
 var tmp = token.split(' ');
 var buf = new Buffer(tmp[1], 'base64');
 var plain_auth = buf.toString();
 var creds = plain_auth.split(':');
 var today = new Date();
 var username = creds[0];
 var password = creds[1];



 if (username == null || password == null) return res.status(400).send({ message: 'Bad Request, Password and Username cannot be null' });

 console.log("Update creds" + username + " " + password)

  connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
    if (error) {
      return res.status(404).send({ message: 'User not found' });
    } else {
      if (results.length > 0) {
        if (bcrypt.compareSync(password, results[0].password)) {
          var cook_time_in_min = req.body.cook_time_in_min;
          var prep_time_in_min = req.body.prep_time_in_min;
          var ingredients = [];
          ingredients = req.body.ingredients;
          var items1 = ingredients;
          var ingredientsList1 = new Set;
          var ingredientsList2 = [];

          console.log(items1[0])
          for (var i = 0; i < items1.length; i++) {
            ingredientsList1.add(items1[i]);
          }

          ingredientsList2 = Array.from(ingredientsList1);

          ingredients = "" + ingredientsList2;

          var niid = uuidv1();
          var recipeid = uuidv1();

          console.log("req.body.steps[0].position" + recipeid)

          var nutrition_information = {
            id: niid,
            calories: req.body.nutrition_information.calories,
            sodium_in_mg: req.body.nutrition_information.sodium_in_mg,
            cholesterol_in_mg: req.body.nutrition_information.cholesterol_in_mg,
            carbohydrates_in_grams: req.body.nutrition_information.carbohydrates_in_grams,
            protein_in_grams: req.body.nutrition_information.protein_in_grams,
            recipeTable_idrecipe: recipeid
          }

          connection.query('SELECT * FROM users WHERE email = ?', username, function (error, result, fields) {

            if (error) {
              return res.status(404).send({ message: 'User not found' });
            } else {
              var author = [];
              console.log(result[0]['id']);
              author = result[0]['id'];
              var recipe = {
                id: recipeid,
                created_ts: today,
                updated_ts: today,
                author_id: author,
                cook_time_in_min: req.body.cook_time_in_min,
                prep_time_in_min: req.body.prep_time_in_min,
                total_time_in_min: cook_time_in_min + prep_time_in_min,
                title: req.body.title,
                cusine: req.body.cusine,
                servings: req.body.servings,
                ingredients: ingredients
              }

              var a = [];
              var stepsArry = req.body.steps;
              for (var l = 0; l < stepsArry.length; l++) {
                a.push(stepsArry[l].position);
                a.sort();
              }
              var stepslength = a[stepsArry.length - 1] - a[0] + 1;
              if (a[0] != 1) {
                return res.status(400).send({ message: 'Bad Request, Please enter the first step' });
              }
              if (stepsArry.length != a[stepsArry.length - 1] - a[0] + 1) {
                return res.status(400).send({ message: 'Bad Request, Steps are not Consecutive' });
              }
              connection.query('INSERT INTO recipe SET ?', recipe, function (error, results, fields) {

                if (error) {
                  console.log("Bad Request", error);
                  res.status(400).send({
                    "failed": "Bad Request, Cannot enter recipe"
                  })
                } else {
                  connection.query('INSERT INTO NutritionInformation SET ?', nutrition_information, function (error, results, fields) {
                    console.log("hi i am here at nutrition_information");

                    if (error) {
                      console.log("Bad Request", error);
                      return res.status(400).send({
                        "failed": "Bad Request, Cannot add nutrition"
                      })
                    } else {
                      // insert steps in to steps-table
                      var stepList = req.body.steps;
                      console.log("steps: " + stepList);
                      // check if steps has atleast one object
                      if (stepList.length > 5) {
                        return res.status(400).send({ message: 'Bad Request, stepsList does not have an object' });
                      }
                      if (!(stepList.some(obj => typeof stepList[0] == 'object') || stepList.length < 5)) {
                        return res.status(400).send({ message: 'Bad Request, stepsList does not have an object' });
                      }
                      else {
                        var steps;
                        // check if position has min 1

                        for (var i = 0; i < stepList.length; i++) {
                          if (stepList[i].position < 1 || stepList[i].position > 5) {
                            return res.status(400).send({ message: 'Bad Request, min 1 position required' });
                          }
                          steps = {
                            position: stepList[i].position,
                            item: stepList[i].items
                          }
                          var stepsid1 = uuidv1();
                          var values = [stepsid1, recipeid, steps.position, steps.item]
                          connection.query('insert into orderlist (id, recipeTable_idrecipe, position, items) values(?,?,?,?)', values, function (error, result, fields) {
                            if (error) {

                              return res.send({
                                "code": 400,
                                "failed": "Bad Request"
                              })
                            } else {
                              console.log("created Succesfully");
                            }
                          })
                        }
                        var output;
                        connection.query("SELECT  id, created_ts,updated_ts,author_id,cook_time_in_min,prep_time_in_min,total_time_in_min,title,cusine,servings,ingredients FROM recipe where id =?", recipeid, function (error, results, fields) {
                          if (error) {
                            return res.status(404).send({ message: 'Recipe data not found' });
                          } else {
                            var ingredients = [];
                            if (results.length > 0) {

                              var ingredientsList = JSON.stringify(results[0]['ingredients']);
                              console.log(ingredientsList);
                              ingredientsList = ingredientsList.split(",")

                              for (i in ingredientsList) {
                                ingredients[i] = ingredientsList[i];
                                console.log(ingredients)
                                ingredients[i] = ingredientsList[i].replace(/[\\"\[\]]/g, '');

                                console.log(ingredients[i]);
                              }

                              console.log(results[0]['steps']);
                              console.log(results[0]);
                              connection.query(' SELECT position, items from orderlist where recipeTable_idrecipe=? ', recipeid, function (error, results1, fields) {
                                if (error) {
                                  return res.status(404).send({ message: 'Orderlist data Not found' });
                                } else {
                                  console.log(results1)
                                  if (results.length > 0) {
                                    console.log("------------" + recipeid);
                                    connection.query(' SELECT calories,cholesterol_in_mg,sodium_in_mg,carbohydrates_in_grams,protein_in_grams from NutritionInformation where recipeTable_idrecipe=? ', recipeid, function (error, results2, fields) {
                                      if (error) {
                                        return res.status(404).send({ message: 'Nutrition data not found' });
                                      } else {
                                        if (results2.length > 0) {
                                          console.log("result------------" + results2.length);
                                          connection.query(' SELECT id,url from Images where recipeTable_idrecipe=? ', recipeid, function (error, image, fields) {
                                            if (error) {
                                              return res.status(404).send({ message: 'Nutrition data not found' });
                                            } else {
                                              if (image.length > 0) {
                                                output = results[0];
                                                output['Images'] = image
                                                output['ingredients'] = ingredients
                                                output['steps'] = results1
                                                output['nutrition_information'] = results2[0]
                                                console.log(results2);
                                                res.send(output);
                                              }else{
                                                output = results[0];
                                                output['Images'] = null
                                                output['ingredients'] = ingredients
                                                output['steps'] = results1
                                                output['nutrition_information'] = results2[0]
                                                console.log(results2);
                                                res.send(output);
                                              }
                                            }
                                          });
                                        }
                                        else {
                                          return res.status(404).send({ message: 'Nutrition not found' });
                                        }
                                      }
                                    });
                                  }
                                  else {
                                    return res.status(404).send({ message: 'Orderlist Not found' });
                                  }
                                }
                              });
                            }
                            else {
                              return res.status(404).send({ message: 'Recipe Not found' });
                            }
                          }
                        });

                      }
                    }
                  });
                }
              }
              );

            }
          });
        } else {
          return res.status(401).send({ message: 'Unauthorized User' });

        }
      }
    }
  });
};

exports.getRecipe = function (req, res) {
  getCounter=getCounter+1;
  client.count("count get recipe api", getCounter);

  logger.info("getting recipe");
  console.log(req.params['id']);

  var recipeid = req.params['id'];

  var output;
  connection.query("SELECT  id, created_ts,updated_ts,author_id,cook_time_in_min,prep_time_in_min,total_time_in_min,title,cusine,servings,ingredients FROM recipe where id =?", recipeid, function (error, results, fields) {
    if (error) {
      return res.status(404).send({ message: 'Recipe Not Found' });
    } else {
      var ingredients = [];
      if (results.length > 0) {

        var ingredientsList = JSON.stringify(results[0]['ingredients']);
        console.log(ingredientsList);
        ingredientsList = ingredientsList.split(",")

        for (i in ingredientsList) {
          ingredients[i] = ingredientsList[i];
          console.log(ingredients)
          ingredients[i] = ingredientsList[i].replace(/[\\"\[\]]/g, '');

          console.log(ingredients[i]);
        }

        console.log(results[0]['steps']);
        console.log(results[0]);
        connection.query(' SELECT position, items from orderlist where recipeTable_idrecipe=? ', recipeid, function (error, results1, fields) {
          if (error) {
            return res.status(404).send({ message: 'Orderlist Data Not Found' });
          } else {
            console.log(results1)
            if (results.length > 0) {
              console.log("------------" + recipeid);
              connection.query(' SELECT calories,cholesterol_in_mg,sodium_in_mg,carbohydrates_in_grams,protein_in_grams from NutritionInformation where recipeTable_idrecipe=? ', recipeid, function (error, results2, fields) {
                if (error) {
                  return res.status(404).send({ message: 'Nutrition Data Not Found' });
                } else {
                  if (results2.length > 0) {
                    console.log("result------------" + results2.length);

                    connection.query(' SELECT id,url from Images where recipeTable_idrecipe=? ', recipeid, function (error, image, fields) {
                      if (error) {
                        return res.status(404).send({ message: 'Nutrition data not found' });
                      } else {
                        if (image.length > 0) {
                          output = results[0];
                          output['Images'] = image
                          output['ingredients'] = ingredients
                          output['steps'] = results1
                          output['nutrition_information'] = results2[0]
                          console.log(results2);
                          res.send(output);
                        }else{
                          output = results[0];
                          output['Images'] = null
                          output['ingredients'] = ingredients
                          output['steps'] = results1
                          output['nutrition_information'] = results2[0]
                          console.log(results2);
                          res.send(output);
                        }
                      }
                    });
                  }
                  else {
                    return res.status(400).send({ message: 'Bad  Request, No Value for this id available in NutritionInformation' });
                  }
                }
              });
            }
            else {
              return res.status(400).send({ message: 'Bad  Request, No Value for this id available in orderlist' });
            }
          }
        });
      }
      else {
        return res.status(404).send({ message: 'Recipe not found' });
      }
    }
  });
};
exports.recipes = function (req, res) {
  getCounter=getCounter+1;
  client.count("count get recipe api", getCounter);

  logger.info("getting recipe");
  console.log(req.params['id']);

  var recipeid = "";

  var output;
  connection.query("SELECT  id, created_ts,updated_ts,author_id,cook_time_in_min,prep_time_in_min,total_time_in_min,title,cusine,servings,ingredients FROM recipe ORDER BY created_ts DESC limit 1", recipeid, function (error, results, fields) {
    if (error) {
      return res.status(404).send({ message: 'Recipe Not Found' });
    } else {
      console.log(results[0].id);
      recipeid=results[0].id;
      var ingredients = [];
      if (results.length > 0) {

        var ingredientsList = JSON.stringify(results[0]['ingredients']);
        console.log(ingredientsList);
        ingredientsList = ingredientsList.split(",")

        for (i in ingredientsList) {
          ingredients[i] = ingredientsList[i];
          console.log(ingredients)
          ingredients[i] = ingredientsList[i].replace(/[\\"\[\]]/g, '');

          console.log(ingredients[i]);
        }

        console.log(results[0]['steps']);
        console.log(results[0]);
        connection.query(' SELECT position, items from orderlist where recipeTable_idrecipe=? ', recipeid, function (error, results1, fields) {
          if (error) {
            return res.status(404).send({ message: 'Orderlist Data Not Found' });
          } else {
            console.log(results1)
            if (results.length > 0) {
              console.log("------------" + recipeid);
              connection.query(' SELECT calories,cholesterol_in_mg,sodium_in_mg,carbohydrates_in_grams,protein_in_grams from NutritionInformation where recipeTable_idrecipe=? ', recipeid, function (error, results2, fields) {
                if (error) {
                  return res.status(404).send({ message: 'Nutrition Data Not Found' });
                } else {
                  if (results2.length > 0) {
                    console.log("result------------" + results2.length);

                    connection.query(' SELECT id,url from Images where recipeTable_idrecipe=? ', recipeid, function (error, image, fields) {
                      if (error) {
                        return res.status(404).send({ message: 'Nutrition data not found' });
                      } else {
                        if (image.length > 0) {
                          output = results[0];
                          output['Images'] = image
                          output['ingredients'] = ingredients
                          output['steps'] = results1
                          output['nutrition_information'] = results2[0]
                          console.log(results2);
                          res.send(output);
                        }else{
                          output = results[0];
                          output['Images'] = null
                          output['ingredients'] = ingredients
                          output['steps'] = results1
                          output['nutrition_information'] = results2[0]
                          console.log(results2);
                          res.send(output);
                        }
                      }
                    });
                  }
                  else {
                    return res.status(400).send({ message: 'Bad  Request, No Value for this id available in NutritionInformation' });
                  }
                }
              });
            }
            else {
              return res.status(400).send({ message: 'Bad  Request, No Value for this id available in orderlist' });
            }
          }
        });
      }
      else {
        return res.status(401).send({ message: 'Unautherized' });
      }
    }
  });
};
exports.deleteRecipe = function (req, res) {
  logger.info("deleting recipe");
  var recipeid = req.params['id'];

  console.log("req", req.body);
  var token = req.headers['authorization'];


  var token = req.headers['authorization'];

  if (!token) return res.status(401).send({ message: 'Unauthorized , No Token Provided' });

  var tmp = token.split(' ');
  var buf = new Buffer(tmp[1], 'base64');
  var plain_auth = buf.toString();
  var creds = plain_auth.split(':');

  var username = creds[0];
  var password = creds[1];

  var userid="";
  if (username == null || password == null) {
    return res.status(400).send({ message: 'Bad Request, Authetication cannot be complete without eamil and password' });
  }
  console.log("user" + username, "password " + password);
  connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
    if (error) {
      return res.status(404).send({ message: 'User Not Found' });
    } else {
      if (results.length > 0) {
        userid=results[0].id;
        if (bcrypt.compareSync(password, results[0].password)) {
          var ins =[recipeid,userid]
         var resultsSelectqlquerry = mysql.format('SELECT * FROM recipe where id= ? AND author_id=?', ins);
         console.log("==========================="+resultsSelectqlquerry);
            connection.query(resultsSelectqlquerry, function (error, results, fields) {
              if (error) {console.log("Bad Request", error);
              res.send({
                "code": 404,
                "failed": "Not Found"
              })}else{
                if (results.length > 0) {
          connection.query('Delete from orderlist where recipeTable_idrecipe= ?', recipeid, function (error, results, fields) {
            console.log("hi i am here at orderlist");

            if (error) {
              console.log("Bad Request", error);
              res.send({
                "code": 404,
                "failed": "Not Found"
              })
            } else {
              
              connection.query('Delete from NutritionInformation where recipeTable_idrecipe= ?', recipeid, function (error, results, fields) {
                console.log("hi i am here at NutritionInformation");

                if (error) {
                  console.log("Not Found", error);
                  res.send({
                    "code": 404,
                    "failed": "Not Found"
                  })
                } else {
                  console.log("at select image");

                  connection.query('select id from Images where recipeTable_idrecipe= ?', recipeid, function (error, results, fields) {
                    if (error) {
                      console.log("Not Found", error);
                      res.send({
                        "code": 404,
                        "failed": "Not Found"
                      })
                    }
                    else {
                      if(results.length > 0){
                      results.forEach(function (img) {
                        console.log(img.id);
                        var params = { Bucket: process.env.bucket, Key: img.id };
                        s3.deleteObject(params, function (err, data) {
                          if (err) {
                            logger.error(err);
                            return res.status(500).send({
                              error: 'Error deleting the file from storage system'
                            });
                          }
                          connection.query('Delete from Images where recipeTable_idrecipe= ?', recipeid, function (error, results, fields) {
                            console.log("hi i am here at delete image");

                            if (error) {
                              console.log("Not Found", error);
                              res.send({
                                "code": 404,
                                "failed": "Not Found"
                              })
                            }else{
                              console.log("author_id-----------"+userid)
                              var ins =[recipeid]
                             var resultsqlquerry = mysql.format('Delete from recipe where id= ?', ins);
                              connection.query(resultsqlquerry,  function (error, results, fields) {
                                console.log("hi i am here at delete recipe");
            
                                if (error) {
                                  console.log("Bad Request", error);
                                  return res.send({
                                    "code": 400,
                                    "failed": "Bad Request, cannot delete recipe before deleting all the images"
                                  })
                                } else {
                                  res.status(204).send({ message: "No Content" });
            
                                }
            
                              });
                            }
                          });
                        });

                      });
                    }else {
                    res.status(204).send({ message: "recioe not Content" });

                  }
                  }
                  
                  })
               
                }

              });
            }

          });
        }else {
          return res.status(404).send({ message: 'Not Found' });

        }
        }});
        } else {
          return res.status(401).send({ message: 'Unauthorized' });

        }
      }else{
        return res.status(404).send({ message: 'User Not Found' });
      }
    }
  });




};

exports.updateRecipe = function (req, res) {
  updateCounter=updateCounter+1;
  client.count("count update recipe api", updateCounter);

  var today = new Date();

  var token = req.headers['authorization'];

  if (!token) return res.status(401).send({ message: 'Unauthorized' });

  var tmp = token.split(' ');
  var buf = new Buffer(tmp[1], 'base64');
  var plain_auth = buf.toString();
  var creds = plain_auth.split(':');

  var username = creds[0];
  var password = creds[1];
  console.log("Update creds" + username + " " + password)
  var parm = "";
  var nutritionparam = "";
  var insertParam = [];
  var insertNutritionParam = [];
  var keys = Object.keys(req.body);
  var nutritionKeys = Object.keys(req.body.nutrition_information)
  if (username == null || password == null) return res.status(400).send({ message: 'Bad Request' });
  var recipeid = req.params['id'];
  var updateRecipeSql = "update recipe set "
  var updateNutritionSql = "update NutritionInformation set ";
  var ingredientsList1 = new Set;
  var ingredients = [];
  ingredients = req.body.ingredients;
  var updateIngredients = false;
  updateOrderlistBool = false;

  if (username == null || password == null) return res.status(400).send({ message: 'Bad Request, Password and Username cannot be null' });

  console.log("Update creds" + username + " " + password)

  if ((req.body.cook_time_in_min) == null || req.body.prep_time_in_min == null || (req.body.title) == null || (req.body.title).trim().length < 1 || (req.body.cusine).trim().length < 1 || (req.body.cusine) == null || req.body.servings == null
    || req.body.ingredients == null || req.body.ingredients.length < 1 || req.body.steps == null || req.body.steps.length < 1
    || req.body.nutrition_information == null || Object.keys(req.body.nutrition_information).length < 1
    || req.body.nutrition_information.protein_in_grams == null || req.body.nutrition_information.calories == null || req.body.nutrition_information.cholesterol_in_mg == null
    || req.body.nutrition_information.sodium_in_mg == null || req.body.nutrition_information.carbohydrates_in_grams == null) {

    return res.status(400).send({
      message: 'Bad Request, Feilds Cannot be null or Empty'
    })
  };

  function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  function isInteger1(value) {
    return !isNaN(value) && parseInt(value) == value && !isNaN(parseInt(value, 10)) && !(typeof value === 'string');
  }

  if (!isNumber(req.body.nutrition_information.protein_in_grams) || !isNumber(req.body.nutrition_information.cholesterol_in_mg) ||
    !isNumber(req.body.nutrition_information.carbohydrates_in_grams) || !isInteger1(req.body.nutrition_information.calories) ||
    !isInteger1(req.body.nutrition_information.sodium_in_mg)) {
    return res.status(400).send({
      message: 'Bad Request, Invalid nutrition_information.'
    })
  }
  if (!(req.body.servings >= 1 && req.body.servings <= 5)) {
    return res.status(400).send({
      message: 'Bad Request, Valid Servings are from 1 to 5'
    })
  }
  if (req.body.cook_time_in_min % 5 != 0 || req.body.prep_time_in_min % 5 != 0) { return res.status(400).send({ message: 'Bad Request, Time should be in multiple of 5' }) };

  var a = [];
  var stepsArry = req.body.steps;
  for (var l = 0; l < stepsArry.length; l++) {
    a.push(stepsArry[l].position);
    a.sort();
  }
  if (a[0] != 1) {
    return res.status(400).send({ message: 'Bad Request, Please enter the first step' });
  }
  if (stepsArry.length != a[stepsArry.length - 1] - a[0] + 1) {
    return res.status(400).send({ message: 'Bad Request, Steps are not Consecutive' });
  }
var userid="";
  connection.query('SELECT * FROM users WHERE email= ?', username, function (error, results, fields) {
    if (error) {
      return res.status(404).send({ message: 'user  Not Found' });
    } else {
      if (results.length > 0) {
        if (bcrypt.compareSync(password, results[0].password)) {
          userid=results[0].id;
          var ins =[recipeid,userid]
         var resultsSelectqlquerry = mysql.format('SELECT * FROM recipe where id= ? AND author_id=?', ins);
          connection.query(resultsSelectqlquerry, function (error, results, fields) {
            if (error) {
              return res.status(404).send({ message: 'Recipe  Not Found' });
            } else {
              if (results.length > 0) {
                console.log("-----------Updating----------------------")
                for (var i = 0; i < keys.length; i++) {
                  if (keys[i] == 'steps') {
                    updateOrderlistBool = true;
                  } else if (keys[i] == 'nutrition_information') {
                    console.log("-----------nutr----------------------" + nutritionKeys[0])
                    for (var j = 0; j < nutritionKeys.length; j++) {
                      console.log(req.body.nutrition_information[nutritionKeys[j]])
                      if (j != nutritionKeys.length - 1) {
                        nutritionparam = nutritionparam + nutritionKeys[j] + "= ?, ";
                      }
                      else {
                        nutritionparam = nutritionparam + nutritionKeys[j] + "= ? ";
                      }
                      insertNutritionParam.push(req.body.nutrition_information[nutritionKeys[j]]);
                    }
                  } else if (keys[i] == "ingredients") {
                    // console.log("not null");
                    updateIngredients = true;
                  }
                  else if (keys[i] != 'ingredients') {
                    parm = parm + keys[i] + "= ?, ";
                    insertParam.push(req.body[keys[i]]);
                  }
                }

                if (updateOrderlistBool) {
                  console.log("---------------updating steps")
                  var stepList = req.body.steps;
                  console.log("steps: " + stepList);
                  // check if steps has atleast one object
                  if (stepList.length > 5) {
                    return res.status(400).send({ message: 'Bad Request, stepsList does not have an object' });
                  }
                  if (!(stepList.some(obj => typeof stepList[0] == 'object') || stepList.length < 5)) {
                    return res.status(400).send({ message: 'Bad Request, stepsList does not have an object' });
                  }
                  var steps;
                  // check if position has min 1
                  connection.query('delete from orderlist where recipeTable_idrecipe=?', recipeid, function (error, result, fields) {
                    if (error) {
                      return res.send({
                        "code": 400,
                        "failed": "Bad Request"
                      })
                    } else {
                      for (var i = 0; i < stepList.length; i++) {
                        if (stepList[i].position < 1 || stepList[i].position > 5) {
                          return res.status(400).send({ message: 'Bad Request, min 1 position required' });
                        }
                        steps = {
                          position: stepList[i].position,
                          item: stepList[i].items
                        }
                        var stepsid1 = uuidv1();
                        var values = [stepsid1, recipeid, steps.position, steps.item]

                        connection.query('insert into orderlist (id, recipeTable_idrecipe, position, items) values(?,?,?,?)', values, function (error, result, fields) {
                          if (error) {
                            console.log("Bad Request", error);
                            return res.send({
                              "code": 400,
                              "failed": "Bad Request"
                            })
                          } else {
                            console.log("created Succesfully");
                          }

                        })
                      }
                    }
                  });

                }

                console.log("----Nutrition-----")
                insertNutritionParam.push(recipeid)
                console.log(updateIngredients);

                var updateNutritionSqlQuery = updateNutritionSql + nutritionparam + " WHERE recipeTable_idrecipe = ?"
                var updateresult = mysql.format(updateNutritionSqlQuery, insertNutritionParam);
                console.log(updateresult)
                connection.query(updateresult, function (error, result, fields) {
                  if (error) {
                    return res.status(400).send({ message: 'Bad Nutrion  Request' });
                  } else {
                    if (updateIngredients) {
                      console.log("not null");

                      ing = true;

                      console.log(ingredients.length)

                      for (var i = 0; i < ingredients.length; i++) {
                        console.log("Item not there")
                        ingredientsList1.add(ingredients[i]);
                      }

                      ingredients = Array.from(ingredientsList1);
                      ingredients = "" + ingredients;
                      console.log(ingredients);
                      parm = parm + "ingredients" + "= ?, ";
                      insertParam.push(ingredients);
                      console.log(parm)
                    }
                    insertParam.push(req.body.cook_time_in_min+req.body.prep_time_in_min);
                    insertParam.push(today);
                    insertParam.push(recipeid)
                    insertParam.push(userid)
                    var updateSqlQuery = updateRecipeSql + parm + "total_time_in_min=? , updated_ts =? WHERE id = ? and author_id=?"
                    var updateresult = mysql.format(updateSqlQuery, insertParam);
                    console.log(updateresult)
                    connection.query(updateresult, function (error, result, fields) {
                      if (error) {
                        return res.status(400).send({ message: 'Bad Request, ingredient data' });
                      } else {
                        var output;
                        connection.query("SELECT  id, created_ts,updated_ts,author_id,cook_time_in_min,prep_time_in_min,total_time_in_min,title,cusine,servings,ingredients FROM recipe where id =?", recipeid, function (error, results, fields) {
                          if (error) {
                            return res.status(400).send({ message: 'Bad Request, recipe data' });
                          } else {
                            var ingredients = [];
                            if (results.length > 0) {

                              var ingredientsList = JSON.stringify(results[0]['ingredients']);
                              console.log(ingredientsList);
                              ingredientsList = ingredientsList.split(",")

                              for (i in ingredientsList) {
                                ingredients[i] = ingredientsList[i];
                                console.log(ingredients)
                                ingredients[i] = ingredientsList[i].replace(/[\\"\[\]]/g, '');

                                console.log(ingredients[i]);
                              }

                              console.log(results[0]['steps']);
                              console.log(results[0]);
                              connection.query(' SELECT position, items from orderlist where recipeTable_idrecipe=? ', recipeid, function (error, results1, fields) {
                                if (error) {
                                  return res.status(400).send({ message: 'Bad Request order data' });
                                } else {
                                  console.log(results1)
                                  if (results.length > 0) {
                                    console.log("------------" + recipeid);
                                    connection.query(' SELECT calories,cholesterol_in_mg,sodium_in_mg,carbohydrates_in_grams,protein_in_grams from NutritionInformation where recipeTable_idrecipe=? ', recipeid, function (error, results2, fields) {
                                      if (error) {
                                        return res.status(400).send({ message: 'Bad Request, nutrition data' });
                                      } else {
                                        if (results2.length > 0) {
                                          console.log("result------------" + results2.length);

                                          connection.query(' SELECT id,url from Images where recipeTable_idrecipe=? ', recipeid, function (error, image, fields) {
                                            if (error) {
                                              return res.status(404).send({ message: 'Nutrition data not found' });
                                            } else {
                                              if (image.length > 0) {
                                                output = results[0];
                                                output['Images'] = image
                                                output['ingredients'] = ingredients
                                                output['steps'] = results1
                                                output['nutrition_information'] = results2[0]
                                                console.log(results2);
                                                res.send(output);
                                              }else{
                                                output = results[0];
                                                output['Images'] = null
                                                output['ingredients'] = ingredients
                                                output['steps'] = results1
                                                output['nutrition_information'] = results2[0]
                                                console.log(results2);
                                                res.send(output);
                                              }
                                            }
                                          });

                                        }
                                        else {
                                          return res.status(400).send({ message: 'Bad  Request, No Value for this id available in NutritionInformation' });
                                        }
                                      }
                                    });
                                  }
                                  else {
                                    return res.status(400).send({ message: 'Bad  Request, No Value for this id available in orderlist' });
                                  }
                                }
                              });
                            }
                            else {
                              return res.status(400).send({ message: 'Bad  Request, No Result Available in Recipe' });
                            }
                          }
                        });
                      }
                    });
                  }

                });
              }
              else {
                return res.status(404).send({ message: 'Bad Request' });
              }
            }
          });
        } else { 
          return res.status(401).send({ message: 'Unauthorized' });
        }
      }
      else {
        return res.status(400).send({ message: 'Bad  Request, user not found' });
      }

    }
  });
}

exports.myRecipeFunction= function (req, res) {
  logger.info("Get myRecipeFunction Recipe");

  console.log("req", req.body);
  var token = req.headers['authorization'];


  var token = req.headers['authorization'];

  if (!token) return res.status(401).send({ message: 'Unauthorized , No Token Provided' });

  var tmp = token.split(' ');
  var buf = new Buffer(tmp[1], 'base64');
  var plain_auth = buf.toString();
  var creds = plain_auth.split(':');

  var username = creds[0];
  var password = creds[1];

  var userid="";
  if (username == null || password == null) {
    return res.status(400).send({ message: 'Bad Request, Authetication cannot be complete without eamil and password' });
  }
  console.log("user" + username, "password " + password);

  client.count("count register recipe api", 1);
  connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
    if (error) {
      return res.status(404).send({ message: 'User Not Found' });
    } else {
      if (results.length > 0) {
        userid=results[0].id;
        if (bcrypt.compareSync(password, results[0].password)) {
          var ins =[userid]
         var resultsSelectqlquerry = mysql.format('SELECT id FROM recipe where author_id=?', ins);
         console.log("==========================="+resultsSelectqlquerry);
            connection.query(resultsSelectqlquerry, function (error, results, fields) {
              if (error) {console.log("Bad Request", error);
              res.send({
                "code": 404,
                "failed": "Not Found"
              })}else{
                console.log(results.length);
                if (results.length > 0) {
                  var output=[];
                  results.forEach(function (img) {
                    console.log(img.id);
                    output1='https://'+process.env.DOMAIN_NAME+'/v1/recipe/' +img.id;
                    output.push(output1)  
                  })
                  let topicParams = {Name: 'EmailTopic'};
                  sns.createTopic(topicParams, (err, data) => {
                      if (err) console.log(err);
                      else {
                          let resetLink = output
                          let payload = {
                              default: 'Hello World',
                              data: {
                                  Email: username,
                                  link: resetLink
                              }
                          };
                          payload.data = JSON.stringify(payload.data);
                          payload = JSON.stringify(payload);
  
                          let params = {Message: payload, TopicArn: data.TopicArn}
                          sns.publish(params, (err, data) => {
                              if (err) console.log(err)
                              else {
                                  console.log('published')
                                  res.status(201).json({
                                      "message": "Reset password link sent on email Successfully!"
                                  });
                              }
                          })
                      }
                  })
  
        

                }else{
                  return res.status(401).send({ message: 'Unauthorized' });
                
              }
              }
            })
          }else{
            return res.status(401).send({ message: 'Unauthorized' });
          
        }
        }else{
            return res.status(404).send({ message: 'User Not Found' });
          
        }
      }
    })

}
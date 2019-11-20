var bcrypt = require('bcrypt');
var mysql = require('mysql');
var connection = require('../models/app.model');
const uuidv1 = require('uuid/v1');
const aws = require('aws-sdk');
var fs = require('fs');
var Client = require('node-statsd-client').Client;
const logger = require('../config/winston');
var client = new Client("localhost", 8125);
require('dotenv').config();

var addImageCounter=0;
var getImageCounter=0;
var deleteImageCounter=0;
var s3 = new aws.S3();
var datbaseStart = new Date();


exports.addRecipeImage = function (req, res, next) {
  var appiStart = new Date();

  logger.info("Add image Api");

  addImageCounter=addImageCounter+1;
  client.count("Add image API counter",addImageCounter);

  var token = req.headers['authorization'];
  if (!token) return res.status(400).send({ message: 'Bad Request,' });
  var recipeid = req.params['recipeId'];
  var tmp = token.split(' ');
  var buf = new Buffer(tmp[1], 'base64');
  var plain_auth = buf.toString();
  var creds = plain_auth.split(':');
  var username = creds[0];
  var password = creds[1];
  if (username == null || password == null) return res.status(400).send({ message: 'Bad Request, Password and Username cannot be null' });
  if(req.file==null) return res.status(400).send({ message: 'Bad Request, Image in form data cannot be null' });
  if(req.file.mimetype==="image/png" ||req.file.mimetype==="image/jpg" || req.file.mimetype==="image/jpeg" )
  { 
  connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
    var userid = "";
    if (error) {
      return res.status(400).send({ message: 'Bad Request' });
    }
    if (results.length < 0 || typeof results[0] === 'undefined') {
      return res.status(404).send({ message: 'Not Found, user not found' });

    }
    if (!bcrypt.compareSync(password, results[0].password)) {

      return res.status(401).send({ message: 'Unauthorized User,Password does not match for the current user' });

    }
   

    userid = results[0].id;
    var ins = [recipeid, userid]
    var resultsSelectqlquerry = mysql.format('SELECT * FROM recipe where id= ? AND author_id=?', ins);
    connection.query(resultsSelectqlquerry, function (error, results, fields) {
      if (error) {
        return res.status(404).send({ message: 'Recipe not found' });
      }
      if (results.length < 0) {

        return res.status(404).send({ message: 'Not Found, Recipe not found for this user' });
      }
      else {
        console.log(req.file);
        console.log("----")
        var image_name = req.file.originalname;
        var selectSql = "SELECT count(imageName) AS Count  FROM Images WHERE imageName = ? and recipeTable_idrecipe=?";
        var insert = [image_name,recipeid];
        var result = mysql.format(selectSql, insert);
        console.log(result)
        connection.query(result, function (error, result, fields) {
          if (error) {
            console.log(error);
            return res.status(404).send({ message: 'Npt' });
          } 
          var count = result[0].Count;
          console.log("------------" + count)
          if (count >= 1) {
              return res.status(400).send({ message: 'Bad Request, Image allready exist , please delete the image and post it' });
          }
          var imageid = uuidv1();


        var fileStream = fs.createReadStream(req.file.path);
        fileStream.on('error', function (err) {
          console.log('File Error', err);
        });
        console.log(process.env.bucket)
        var uploadParams = { Bucket: process.env.bucket, Key: imageid, Body: '' };
        uploadParams.Body = fileStream;
        s3.upload(uploadParams, function (err, data1) {
          var s3called = new Date();
          console.log(s3called);
          console.log(appiStart);
          var s3Timer =s3called-appiStart;
          console.log(s3Timer);
          client.count("Process time for image upload to s3", s3Timer);
          if (err) {
            console.log(err);
            return res.status(400).send({ message: 'Bad Request, Please Add image correctly' });
          } if (data1) {
            var param1 = { Bucket: process.env.bucket, Key: imageid};
            s3.getObject(param1, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else    {
                 console.log(data); 
                console.log(data1);
                }        // successful response
            
            // res.send("uploded")
            var image = {
              id: imageid,
              imageName: image_name,
              url: data1.Location,
              recipeTable_idrecipe: recipeid,
              AcceptRanges: data.AcceptRanges,
              LastModified: data.LastModified,
              ContentLength: data.ContentLength,
              ETag: data.ETag,
              ContentType: data.ContentLength,
            }
            var databsecalled = new Date();
            connection.query('INSERT INTO Images SET ?', image, function (error, results, fields) {
             
              var dbapiTimer =appicalled-databsecalled;
              console.log(dbapiTimer);
              client.count("Process time of Image database", dbapiTimer);

              var appicalled = new Date();
              
              console.log(appicalled);
              console.log(appiStart);

              var apiTimer =appicalled-appiStart;
              console.log(apiTimer);
              client.count("Process time of Image API", apiTimer);

              if (error) {
                console.log("Bad Request", error);  
                res.status(400).send({
                  "failed": "Bad Request, Cannot enter recipe"
                })
              } else {
                res.status(201).send({ 
                  
                  "id": imageid,
                  "url":data1.Location
                 });


              }
            });
          });
          }
        });
        });
      }
    });
  });

}else{
  return res.status(400).send({ message: 'Bad Request, Please Add image in correct format' });
}
}

exports.getRecipeImage = function (req, res) {
  logger.info("Get Image Api");

  getImageCounter=getImageCounter+1;
  client.count("Get image API counter",getImageCounter);
  var imageid = req.params['imageId'];
  var recipeTable_idrecipe = req.params['recipeId'];

  var ins = [ imageid, recipeTable_idrecipe]

  var resultsSelectqlquerry = mysql.format('SELECT * FROM Images where id= ? and recipeTable_idrecipe=? ', ins);
  connection.query(resultsSelectqlquerry, function (error, results, fields) {
    if (error) {
      return res.status(400).send({ message: 'Bad Request' });
    }
    if (results.length < 0 || typeof results[0] === 'undefined') {
      return res.status(404).send({ message: 'Not Found, Image not found' });

    }
    else {
      var param1 = { Bucket: process.env.bucket, Key: imageid};
            s3.getObject(param1, function(err, data) {
              if (err)  return res.status(404).send({ message: 'Not Found, Image not found' });
              // an error occurred
            });
      res.status(201).send({ 
        "id": imageid,
        "url":results[0].url
       });
    }
  });
};

exports.deleteRecipeImage = function (req, res) {
  console.log("inside delete")

  logger.info("Delete Image Api");

  deleteImageCounter=deleteImageCounter+1;
  client.count("Delete image API counter",1);
  var token = req.headers['authorization'];
  if (!token) return res.status(400).send({ message: 'Bad Request,Please provide Authorization' });
  var recipeid = req.params['recipeId'];
  var imageId = req.params['imageId'];
  var tmp = token.split(' ');
  var buf = new Buffer(tmp[1], 'base64');
  var plain_auth = buf.toString();
  var creds = plain_auth.split(':');
  var username = creds[0];
  var password = creds[1];
console.log(username)
  if (username == null || password == null) return res.status(400).send({ message: 'Bad Request, Password and Username cannot be null' });
  connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
    var userid = "";
    if (error) {
      return res.status(400).send({ message: 'Bad Request' });
    }
    if (results.length < 0 || typeof results[0] === 'undefined') {
      return res.status(404).send({ message: 'Not Found, user not found' });

    }
    if (!bcrypt.compareSync(password, results[0].password)) {

      return res.status(401).send({ message: 'Unauthorized User,Password does not match' });

    }
    userid = results[0].id;
    var ins = [recipeid, userid]
    var resultsSelectqlquerry = mysql.format('SELECT * FROM recipe where id= ? AND author_id=?', ins);
    connection.query(resultsSelectqlquerry, function (error, results, fields) {
      if (error) {
        return res.status(404).send({ message: 'Recipe  Not Found' });
      }
      if (results.length < 0  || typeof results[0] === 'undefined') {

        return res.status(404).send({ message: 'Not Found, Recipe not found for this user' });
      }
      else {
        console.log("----")
        var selectSql = "SELECT count(imageName) AS Count,url,imageName,id  FROM Images WHERE id = ?";
        var insert = [imageId];
        var result = mysql.format(selectSql, insert);
        connection.query(result, function (error, result, fields) {
          if(error){return res.status(404).send({ message: 'Not Found, Image doesnot exist' });}
          var count = result[0].Count;
          console.log("------------" + count)
          if (count < 1) {
              return res.status(404).send({ message: 'Not Found, Image doesnot exist' });
          }
          
     
     
          var deleteParams = {Bucket: process.env.bucket,  Key: result[0].id};
          s3.deleteObject(deleteParams, function (err, data) {
            if (err) {
              console.log(err, err.stack);
              return res.status(400).send({ message: 'Bad Request, Please Add image correctly' });
            } else{
                         
              console.log("Delete Success" );
              connection.query('delete from Images where id= ?', imageId, function (error, results, fields) {
                if (error) {
                  console.log("Bad Request", error);
                  res.status(400).send({
                    "failed": "Bad Request, Cannot Delete recipe"
                  })
                } else {
                  console.log(data);
                  res.status(204).send({ message: 'No Content' });
                }
              });
            }
          })  
        })
      }
    });
  });
};


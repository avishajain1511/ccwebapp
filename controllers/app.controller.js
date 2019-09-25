var bcrypt = require('bcrypt');
var validator = require("email-validator");
var mysql      = require('mysql');
var connection = require('../models/app.model');
var schema = require('./passwordValidator');
const uuidv1 = require('uuid/v1');

exports.register = function(req,res){
    
    console.log("req",req.body);
    if(req.body.firstname==null || req.body.lastname==null|| (req.body.firstname).trim().length<1 ||(req.body.lastname).trim().length<1 || req.body.password==null || req.body.email==null){

        return res.status(400).send({ auth: false, message: 'Bad Request'
    })};

    if(!validator.validate(req.body.email)){return res.status(400).send({ message: 'Bad Request'})};

    if(!schema.validate(req.body.password)){return  res.status(400).send({  message: 'Bad Request'})};

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    var today = new Date();    
    var uuid =uuidv1();
    var users={
      id:uuid,
      firstname: req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email,
      password:hash,
      created:today,
      modified:today
    }
    
    var selectSql ="SELECT count(email) AS Count  FROM users WHERE email = ?";
    var insert =[users.email ];
    var result =  mysql.format(selectSql,insert);
    connection.query(result, function (error, result, fields) {
        var count = result[0].Count;
       console.log("------------"+count)
        if(count>=1){
           return res.status(400).send({ auth: false, message: 'Bad Request' });
        }else{
            connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
                if (error) {
                  console.log("Bad Request",error);
                  res.send({
                    "code":400,
                    "failed":"Bad Request"
                  })
                }else{
                    var sql ='SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                    var insert =[users.email]
                    var result =  mysql.format(sql,insert);
    
                    connection.query(result, function (error, result, fields) {
                        if (error) {
                            console.log("Bad Request",error);
                            res.send({
                            "code":400,
                            "failed":"Bad Request"
                        })
                    }
                    else{
                        res.status(201).send(result);
                    }
                });
                }
            });
        }  
    });

  };

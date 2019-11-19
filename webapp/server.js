const express = require('express');
const bodyParser = require('body-parser');
const app = require('./routes/app.route');
var http = express.createServer();

http.use(bodyParser.urlencoded({ extended: true }));
http.use(bodyParser.json());
http.use('/v1',app);

let port = 3001;

// set up a route to redirect http to https
http.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);

    // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
    // res.redirect('https://example.com' + req.url);
})

// have it listen on 8080
http.use(function(req, res, next){
if (req.accepts('html')) {
    res.status(400).send({message:"Bad  Request"}) ;
    return;
      }
    });
http.listen(port,()=>{
console.log('Server is up and running on port number' + port);

});

module.exports = server;


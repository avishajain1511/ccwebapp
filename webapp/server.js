const express = require('express');
const bodyParser = require('body-parser');
const app = require('./routes/app.route');
const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use('/v1',app);

let port = 22;

server.use(function(req, res, next){
if (req.accepts('html')) {
    res.status(400).send({message:"Bad  Request"}) ;
    return;
      }
    });
server.listen(port,()=>{
console.log('Server is up and running on port number' + port);

});
server.use(function(req, res, next) {
  if ((req.get('X-Forwarded-Proto') !== 'https')) {
    res.redirect('https://' + req.get('Host') + req.url);
  } else
    next();
});
module.exports = server;


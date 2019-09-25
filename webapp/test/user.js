process.env.NODE_ENV = "test"

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../webapp/routes/app.route');
const should = chai.should();
chai.use(chaiHttp);

// https://medium.com/@tariqul.islam.rony/simple-rest-api-builing-with-mysql-and-express-js-and-testing-with-mocha-and-chai-ed0d19f25f79

process.env.NODE_ENV = "test"

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
var request = require('superagent');
chai.use(chaiHttp);
var expect = chai.expect;

//set up the data we need to pass to the login method
const userCredentials = {
    email: "arjun@gmail.com",
    password: "PaSSword@123"
}
const wrongPostCredentials = {
    email: "arjun@gmail.com",
    password: "PaSSword@123"
}
const wrongPostCredentials2 = {
    firstname: "testinggitproj",
    lastname: "test",
    password: "PaSSword@123"
}

const wrongCreds = {
    firstname: "testinggitproj",
    lastname: "test",
    email: "arjun@gmail.com",
    password: "PaSSword@123"
}
const validCreds = {
    firstname: "testinggitproj",
    lastname: "test",
    password: "PaSSword@123"
}

var authenticatedUser = request.agent(app);

describe('GET /user', function (done) {

    it("should get all students record", (done) => {
        chai.request(app)
            .get('/v1/user/self')
            .auth('arjun@gmail.com', 'PaSSword@123')
            .then((res) => {
                //assertions
                expect(res).to.have.status(200);
                expect(res.body.message).to.be.equal("Auth OK");
                expect(res.body.errors.length).to.be.equal(0);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });
    it("wrong creds", (done) => {
        chai.request(app)
            .put('/v1/user/self')
            .auth('arjun@gmail.com', 'PaSSword@123')
            .send(wrongCreds)
            .then((res) => {
                //assertions
                expect(res).to.have.status(400);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });
    it("valid creds", (done) => {
        chai.request(app)
            .put('/v1/user/self')
            .auth('arjun@gmail.com', 'PaSSword@123')
            .send(validCreds)
            .then((res) => {
                //assertions
                expect(res).to.have.status(204);
            }).catch(err => {
                console.log(err.message);
            }).then(done);
    });
    it("Unvalid creds", (done) => {
        chai.request(app)
            .post('/v1/user/')
            .send(wrongPostCredentials)
            .then((res) => {
                //assertions
                expect(res).to.have.status(400);
                done();
            }).catch(err => {
                console.log(err.message);
            });
    });
    it("Unvalid 2 creds", (done) => {
        chai.request(app)
            .post('/v1/user/')
            .send(wrongPostCredentials2)
            .then((res) => {
                //assertions
                expect(res).to.have.status(400);
                done();

            }).catch(err => {
                done(err);
            });
    });


});
 


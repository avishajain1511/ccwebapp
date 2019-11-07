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
const validCreds1 = {
    firstname: "testinggitproj",
    lastname: "test",
    email: "arjun@gmail.com",
    password: "PaSSword@123"
}

var authenticatedUser = request.agent(app);
// set up the data we need to pass to the method
const validRecipe = {
    "cook_time_in_min": 15,
    "prep_time_in_min": 15,
    "title": "Creamy Cajun Chicken Pasta",
    "cusine": "Italian",
    "servings": 2,
    "ingredients": [
      "4 ounces linguine pasta",
      "2 boneless, skinless chicken breast halves, sliced into thin strips",
      "2 teaspoons Cajun seasoning",
      "2 tablespoons butter"
    ],
    "steps": [
      {
        "position": 1,
        "items": "some text here"
      }
    ],
    "nutrition_information": {
      "calories": 100,
      "cholesterol_in_mg": 4,
      "sodium_in_mg": 100,
      "carbohydrates_in_grams": 53.7,
      "protein_in_grams": 53.7
    }
  }

const invalidRecipe = {
    "cook_time_in_min": 15,
    "prep_time_in_min": 15,
    "title": " ",
    "cusine": "Italian",
    "servings": 2,
    "ingredients": [
      "4 ounces linguine pasta",
      "2 boneless, skinless chicken breast halves, sliced into thin strips",
      "2 teaspoons Cajun seasoning",
      "2 tablespoons butter"
    ],
    "steps": [
      {
        "position": 1,
        "items": "some text here"
      }
    ],
    "nutrition_information": {
      "calories": 100,
      "cholesterol_in_mg": 4,
      "sodium_in_mg": 100,
      "carbohydrates_in_grams": 53.7,
      "protein_in_grams": 53.7
    }
}  
// test methods
var authenticatedUser = request.agent(app);

describe('POST /recipe', function (done) {
    it("valid entry ", (done)=> {
        chai.request(app)
        .get('/v1/recipe/:id')
        .auth('arjun2@gmail.com', 'PaSSword@123')
        .send(validRecipe)
        .then((res) => {
            //assertions
            expect(res).to.have.status(400);
        }).catch(err => {
            console.log(err.message);
        }).then(done);
    });
    it("Invalid entry ", (done) => {
        chai.request(app)
        .post('/v1/recipe/')
        .auth('arjun@gmail.com', 'PaSSword@123')
        .send(invalidRecipe)
        .then((res) => {
            //assertions
            expect(res).to.have.status(400);
            done();
        }).catch(err => {
            done(err);
        });
    });
});
describe('GET /user', function (done) {

    it("valid entry ", (done)=> {
        chai.request(app)
        .get('/v1/recipe/:id')
        .auth('arjun2@gmail.com', 'PaSSword@123')
        .send(validRecipe)
        .then((res) => {
            //assertions
            expect(res).to.have.status(404);
        }).catch(err => {
            console.log(err.message);
        }).then(done);
    });

    it("Unvalid 2 creds", (done) => {
        chai.request(app)
            .post('/v1/user/')
            .send(wrongPostCredentials2)
            .then((res) => {
                //assertions
                this.timeout(500);
                setTimeout(done, 300);
                expect(res).to.have.status(400);
                done();

            }).catch(err => {
                done(err);
            });
    });


});
 


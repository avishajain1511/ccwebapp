Readme.md
# CSYE 6225 - Fall 2019


## Team  Information

| Name | NEU ID | Email Address |
| Achira Shah | 001409351 | shah.ac@husky.neu.edu |
| Arjun Agarwal | 01443323 | agrawal.arj@husky.neu.edu |
| Chethan Sreenivas | 001833160 | turuvekeresreeniva.c@husky.neu.edu |


## Technology Stack

Node.js
Express.JS
REST API
git
mysql


## Build Instructions

git clone git@github.com:achirashah/ccwebapp.git

cd ccwebapp/webapp

npm install


## Deploy Instructions

npm start

## Routes

Routes - visit http://localhost:3001
GET - /v1​/user​/self (Get User Information)
PUT - ​/v1​/user​/self (Update user information)
POST - /v1​/user (Create a user)
POST - /v1/user/recipie/ (Create a Recipe)
Get - /v1/user/recipie/:id (Get a Recipe)
Put - /v1​/user/recpie/:id (Update a Recipe)
Delete - /v1​/user/:id (Delete a Recipe)
Install Postman to interact with REST API

create user with 
url - http://localhost:3001/v1/user
Method: POST
Body: raw + JSON (application/json)
Body Content: {"firstname": "test", "lastname":"test", "email":"test@test.com", "password":"password"}

get user information with
url - http://localhost:3001/v1/user/self
Method: GET
Authorization - add - username - emailId and password - password

update user information with
url - http://localhost:3001/v1/user/self
Method: PUT
Authorization - add - username - emailId and password - password
Body: raw + JSON (application/json)
Body Content: {"firstname": "test", "lastname":"test", "password":"password"} 

## Running Tests
mocha 

## CI/CD

## Infrastructure

For Terraforms use 
    Terraform apply
    Terraform destroy

Change the paramters in .tfvars file to make changes in VPC properties

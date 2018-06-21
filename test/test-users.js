"use strict";
require("dotenv").config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");

const { TEST_DATABASE_URL } = require("../config");
const {app, runServer, closeServer} = require("../server");
const {User} = require("../users");

const expect = chai.expect;

chai.use(chaiHttp);

function seedUserData() {
    const seedData=[];
    for (let i=1; i<=10; i++) {
        seedData.push(generateUserData(i));
      }

    return User.insertMany(seedData);
}

function generateUserData(num){
    let uName= "testUsername" + num;
    let pWord= "testPassword" + num;
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: uName,
        password: pWord
    }
}

function tearDownDb() {
    console.warn("Deleting database");
    return mongoose.connection.dropDatabase();
}

describe("Users API", function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function(){
        return seedUserData();
    });

    afterEach(function(){
        return tearDownDb();
    });
    
    after(function() {
        return closeServer();
    });

    describe("POST", function(){
        const newUser = generateUserData(500);

        it("Should successfully create a new user", function(){
            return chai
            .request(app)
            .post("/api/users")
            .send(newUser)
            .then((res)=>{
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res).to.be.a("object");
                expect(res.body).to.include.keys("username","firstName","lastName");
                expect(res.body.id).to.not.be.null;
            })
        })

        it("Should reject users entering a missing username", function(){
            let missingUN = generateUserData(200);
            delete missingUN.username;

            return chai
            .request(app)
            .post("/api/users")
            .send(missingUN)
            .then((res)=>{
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('"username" is required');
            })
        });

        it("Should reject duplicate usernames", function(){
     
            return User
                .findOne()
                .then((res)=>{
                    let sameUser = generateUserData(200);
                    sameUser.username = res.username;
                    return chai
                    .request(app)
                    .post("/api/users")
                    .send(sameUser)
                })
                .then((res)=>{
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body.message).to.equal("Username already taken");
                    expect(res.body.reason).to.equal("ValidationError");
                })
            })

        it("Should reject users entering forbidden characters in password", function(){
            let pwUser = generateUserData(300);
            pwUser.password = `testinvalidcharac ters`;

            return chai
            .request(app)
            .post("/api/users")
            .send(pwUser)
            .then((res)=>{
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('"password" with value "testinvalidcharac ters" fails to match the required pattern: /^[A-Za-z0-9_!@$]+$/');
            })
        });
    })
})
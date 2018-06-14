"use strict";

require('dotenv').config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");

const { TEST_DATABASE_URL } = require('../config');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');

const expect = chai.expect;

chai.use(chaiHttp);

describe("api/users", function() {
    const username1 = "testUserName1";
    const password1 = "testPassword1";
    const firstName1 = "testFirstName1";
    const lastName1 = "testlastName1";

    const username2 = "testUserName2";
    const password2 = "testPassword2%";
    const firstName2 = "testFirstName2";
    const lastName2 = "testlastName2";

    before(function() {
        return runServer();
    });
    
    after(function() {
        return closeServer();
    });

    afterEach(function() { 
        return User.remove({});
    });

    describe("POST", function(){
        it("Should reject users entering a missing username", function(){
            return chai
            .request(app)
            .post("/api/users")
            .send({
                "password": password2,
                "firstName": firstName2,
                "lastName": lastName2
            })
            .then((res)=>{
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('"username" is required');
            })
        });

        it("Should successfully create a new user", function(){
            return chai
            .request(app)
            .post("/api/users")
            .send({
                "password": password1,
                "firstName": firstName1,
                "lastName": lastName1,
                "username": username1
            })
            .then((res)=>{
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res).to.be.a("object");
                expect(res.body).to.have.property("username");
                expect(res.body).to.have.property("firstName");
                expect(res.body).to.have.property("lastName");
            })
        });

        it("Should reject duplicate usernames", function(){
            return chai
            .request(app)
            .post("/api/users")
            .send({
                "password": password2,
                "firstName": firstName2,
                "lastName": lastName2,
                "username": username2                 
            })
            .then((res)=>{
                expect(res).to.have.status(422);
                expect(res).to.be.json;
                expect(res.body.message).to.equal("Username already taken");
                expect(res.body.reason).to.equal("ValidationError");
            })
        })

        it("Should reject users entering forbidden characters in password", function(){
            return chai
            .request(app)
            .post("/api/users")
            .send({
                "password": password2,
                "firstName": firstName2,
                "lastName": lastName2,
                "username": username2
            })
            .then((res)=>{
                console.log(res.body);
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('"password" with value "testPassword2%" fails to match the required pattern: /^[A-Za-z0-9_!@$]+$/');
            })
        });
    }) 
})
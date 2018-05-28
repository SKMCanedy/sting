"use strict";

const { TEST_DATABASE_URL } = require('../config');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");

const expect = chai.expect;

chai.use(chaiHttp);

describe("api/user", function() { //why is this singular user?
    const username1 = faker.internet.userName;
    const password1 = faker.internet.password;
    const firstName1 = faker.name.firstName;
    const lastName1 = faker.name.lastName;
    const username2 = faker.internet.userName;
    const password2 = faker.internet.password;
    const firstName2 = faker.name.firstName;
    const lastName2 = faker.name.lastName;

    before(function() {
        return runServer();
    });
    
    after(function() {
        return closeServer();
    });

    //should there be a beforeEach here even if it's empty?

    afterEach(function() {
        return User.remove({});
    });

    describe("/api/users", function (){
        describe("POST", function(){
            it("Should reject users entering a missing username", function(){
                return chai
                .request(app)
                .post("/api/users")
                .send({
                    password1,
                    firstName1,
                    lastName1
                })
                .then((res)=>{
                    console.log(res.body);
                    // const res = err.response;
                    expect(res).to.have.status(400);
                    // expect(res).to.have.an.error;
                    expect(res.body.message).to.equal('"firstName" is required');
                })
            })
        })


    })

      
})
"use strict";
//adding for merge
require('dotenv').config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL } = require('../config');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const { JWT_SECRET } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe("api/auth", function() {
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

    describe('/api/auth', function () {
        it('Should return a valid auth token', function () {
            return chai
              .request(app)
              .post('/api/auth/')
              .send({ username1, password1 })//needs to be updated based on how i seed database
              .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                const token = res.body.authToken;
                expect(token).to.be.a('string');
                const payload = jwt.verify(token, JWT_SECRET, {
                  algorithm: ['HS256']
                });
                expect(payload.user).to.deep.equal({
                  username,
                  firstName,
                  lastName
                });
            });
        });
    })
})
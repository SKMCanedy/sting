"use strict";

const {app, runServer, closeServer} = require("../server");
const {User} = require("../users");
const {Issue} = require("../issues");
const { TEST_DATABASE_URL } = require("../config")

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");


const expect = chai.expect;

chai.use(chaiHttp);

function generateIssueData(num){
    let randTicketNum= faker.random.word() + num;
    return {
        ticketNumber: randTicketNum,
        issueSummary:faker.lorem.sentence(),
        customerImpact:[faker.lorem.words(), faker.lorem.words()],
        ticketOpenDate:faker.date.past(2),
        issueFrequency:faker.random.number(500),
        affectedTeams:[faker.lorem.words(), faker.lorem.words()],
        assignedDevTeam: faker.random.word(),
        weeklyPotentialLoss:faker.random.number(10000),
        weeklyTeamCost:faker.random.number(10000),
        weeklyTotalCost:faker.random.number(10000),
        modifiedBy:faker.lorem.word()
    }

}

const sampleIssue=
    {
        "ticketNumber": faker.random.number(10000),
        "issueSummary": "Testing",
        "customerImpact":["Testing1"],
        "ticketOpenDate":"02/12/2018",
        "issueFrequency":10,
        "affectedTeams":["Testing1"],
        "assignedDevTeam": "Testing",
        "weeklyPotentialLoss":100,
        "weeklyTeamCost":100,
        "weeklyTotalCost":100,
        "modifiedBy":"test"
    }

function seedIssueData() {
    const seedData=[];
    for (let i=1; i<=10; i++) {
        seedData.push(generateIssueData(i));
    }

    return Issue.insertMany(seedData);
}

describe("issues", function() {
  const testUser = {
    username: "user_test_issues",
    password: "123123",
    firstName: "1",
    lastName: "2"
  };
  let authToken = null;

  before(() => {
    return runServer(TEST_DATABASE_URL)
      .then(() => User.hashPassword("123123"))
      .then(hash => User.create({
        ...testUser,
        password: hash
      }))
      .then(() => chai
        .request(app)
        .post("/api/auth/login")
        .send({
          username: "user_test_issues",
          password: "123123"
        }))
      .then(res => {
        authToken = res.body.authToken
      });
  });

  beforeEach(()=>{
    return seedIssueData();
  })

  afterEach(()=>{
    return mongoose.connection.dropDatabase();
  })

  after(() => {
    return User.findOneAndRemove({ username: "user_test_issues"}).then(() => {
      closeServer();
    })
  });

    describe("GET Route", function(){
        it("should return all issues", () => {
            return chai
            .request(app)
            .get("/api/issues")
            .set("Authorization", `Bearer ${authToken}`)
            .send()
            .then(res => {
                expect(res).to.have.status(200);
            })
        });
        })

    describe("POST Route", function(){
        it("Should add a new issue", function(){
            return chai
            .request(app)
            .post("/api/issues")
            .set("Authorization", `Bearer ${authToken}`)
            .send(sampleIssue)
            .then((res)=>{
                expect(res).to.have.status(201);
                expect(res).to.be.json;
            })
        })
    });

    describe("PUT Route", function(){

        it("Should update an issue", function(){
            return Issue.findOne().then((singleIssue)=>{
            return chai
            .request(app)
            .put(`/api/issues/${singleIssue.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(sampleIssue)
            .then((res)=>{
                expect(res).to.have.status(200);
                expect(res).to.be.json;
            })
        })
        })
    })

    describe("DELETE Route", function(){

        it("Should delete an issue", function(){
            return Issue.findOne().then((singleIssue)=>{
            return chai
            .request(app)
            .delete(`/api/issues/${singleIssue.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send()
            .then((res)=>{
                expect(res).to.have.status(200);
            })
        })
        })
    })
});
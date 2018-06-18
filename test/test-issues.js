"use strict";

require('dotenv').config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL } = require('../config');
const {app, runServer, closeServer} = require('../server');
const {Issue} = require('../issues');

const expect = chai.expect;

chai.use(chaiHttp);

function seedData(){
    const testIssueData=[];

    for (let i=1; i<=10; i++){
        testIssueData.push(generateIssueData(i));
    }
    console.log(testIssueData);
    return Issue.insertMany(testIssueData);
}

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

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}


describe("Issues API", function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function(){
        return seedData();
    })

    afterEach(function() { 
        // return tearDownDb();
    });
    
    after(function() {
        return closeServer();
    });

    describe("GET", function(){
        it("Should return all existing issues", function(){
            return chai
            .request(app)
            .get("/api/issues/")
            .set('some_custom_attribute', 'some_value')
            .then((res)=>{
                // console.log(res)
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.above(0);
                res.body.forEach(function(item) {
                  expect(item).to.be.a('object');
                  expect(item).to.have.all.keys(
                    'id', 
                    'ticketNumber', 
                    'issueSummary', 
                    'ticketOpenDate',
                    'issueFrequency',
                    'affectedTeams',
                    'assignedDevTeam',
                    'weeklyPotentialLoss',
                    'weeklyTeamCost',
                    'weeklyTotalCost',
                    'modifiedBy'
                    );
                }); 
            })
        })
    });
});

//     describe("POST", function(){
//         it("Should add a new issue", function(){
//             return chai
//             .request(app)
//             .post("/api/issues/")
//             .send({
//                 "ticketNumber": ticketNumber1,
//                 "issueSummary": issueSummary1,
//                 "customerImpact": customerImpact1,
//                 "ticketOpenDate": ticketOpenDate1,
//                 "issueFrequency": issueFrequency1,
//                 "affectedTeams": affectedTeams1,
//                 "assignedDevTeam": assignedDevTeam1,
//                 "weeklyPotentialLoss": weeklyPotentialLoss
//             })
//             .then((res)=>{
//                 expect(res).to.have.status(201);
//                 expect(res).to.be.json;
//                 expect(item).to.have.all.keys(
//                     'id', 
//                     'ticketNumber', 
//                     'issueSummary', 
//                     'ticketOpenDate',
//                     'issueFrequency',
//                     'affectedTeams',
//                     'assignedDevTeam',
//                     'weeklyPotentialLoss',
//                     'weeklyTeamCost',
//                     'weeklyTotalCost',
//                     'modifiedBy'
//                 );
//             })
//         })
//     });

//     describe("PUT", function(){
//         it("Should update an issue", function(){
//             return chai
//             .request(app)
//             .post("/api/issues/id")//need to update id based on whether this is pre-seeded data or data from above
//             .send({
//                 "ticketNumber": ticketNumber1,
//                 "issueSummary": issueSummary1 + " Updated",
//                 "customerImpact": customerImpact1,
//                 "ticketOpenDate": ticketOpenDate1,
//                 "issueFrequency": issueFrequency1,
//                 "affectedTeams": affectedTeams1,
//                 "assignedDevTeam": assignedDevTeam1,
//                 "weeklyPotentialLoss": weeklyPotentialLoss
//             })
//             .then((res)=>{
//                 expect(res).to.have.status(200);
//                 expect(res).to.be.json;
//                 expect(item).to.have.all.keys(
//                     'id', 
//                     'ticketNumber', 
//                     'issueSummary', 
//                     'ticketOpenDate',
//                     'issueFrequency',
//                     'affectedTeams',
//                     'assignedDevTeam',
//                     'weeklyPotentialLoss',
//                     'weeklyTeamCost',
//                     'weeklyTotalCost',
//                     'modifiedBy'
//                 );
//             })
//         })

//     });

//     describe("DELETE", function(){
//         it("Should delete an issue", function(){
//             return chai
//             .request(app)
//             .delete("/api/issues/id")//need to update id based on whether this is pre-seeded data or data from above
//             .then((res)=>{
//                 expect(res).to.have.status(200);
//             })
//         })
//     })
// });
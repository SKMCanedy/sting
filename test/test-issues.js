"use strict";

//https://courses.thinkful.com/node-001v5/assignment/2.3.1

require('dotenv').config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");

const { TEST_DATABASE_URL } = require('../config');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');

const expect = chai.expect;

chai.use(chaiHttp);

describe("api/issues", function() {
    const ticketNumber1 = "Test-001";
    const issueSummary1 = "Test Summary 1"; 
    const customerImpact1 = ["Test Customer Impact 1"];
    const ticketOpenDate1 = "2018-03-15T07:00:00.000Z";
    const issueFrequency1 = 10;
    const affectedTeams1 = ["Test Support Team 1", "Test Support Team 1.2"];
    const assignedDevTeam1 = "Test Dev Team 1";
    const weeklyPotentialLoss = 100;
    

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    
    after(function() {
        return closeServer();
    });

    beforeEach(function(){

    })

    afterEach(function() { 
        return Issue.remove({});
    });

    describe("GET", function(){
        it("Should return all existing issues", function(){
            return chai
            .request(app)
            .get("/api/issues/")
            .then((res)=>{
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

    describe("POST", function(){
        it("Should add a new issue", function(){
            return chai
            .request(app)
            .post("/api/issues/")
            .send({
                "ticketNumber": ticketNumber1,
                "issueSummary": issueSummary1,
                "customerImpact": customerImpact1,
                "ticketOpenDate": ticketOpenDate1,
                "issueFrequency": issueFrequency1,
                "affectedTeams": affectedTeams1,
                "assignedDevTeam": assignedDevTeam1,
                "weeklyPotentialLoss": weeklyPotentialLoss
            })
            .then((res)=>{
                expect(res).to.have.status(201);
                expect(res).to.be.json;
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
            })
        })
    });

    describe("PUT", function(){
        it("Should update an issue", function(){
            return chai
            .request(app)
            .post("/api/issues/id")//need to update id based on whether this is pre-seeded data or data from above
            .send({
                "ticketNumber": ticketNumber1,
                "issueSummary": issueSummary1 + " Updated",
                "customerImpact": customerImpact1,
                "ticketOpenDate": ticketOpenDate1,
                "issueFrequency": issueFrequency1,
                "affectedTeams": affectedTeams1,
                "assignedDevTeam": assignedDevTeam1,
                "weeklyPotentialLoss": weeklyPotentialLoss
            })
            .then((res)=>{
                expect(res).to.have.status(200);
                expect(res).to.be.json;
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
            })
        })

    });

    describe("DELETE", function(){
        it("Should delete an issue", function(){
            return chai
            .request(app)
            .delete("/api/issues/id")//need to update id based on whether this is pre-seeded data or data from above
            .then((res)=>{
                expect(res).to.have.status(200);
            })
        })
    })
});
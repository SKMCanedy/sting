"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');


const {Issue} = require("./models");


const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });


//-- CRUD Routes --

router.get('/', jwtAuth, (req,res) => {
    console.log("GET all route accessed");
    Issue
    .find()
    .then(openIssues => {
        const allOpenIssues = openIssues.map((issues) => issues.serialize());
        res.json(allOpenIssues);
        });
});

router.get('/:id', jwtAuth, (req,res) => {
    console.log("GET single route accessed");
    Issue
    .findById(req.params.id)
    .then(singleIssue => {
        const issueDetails = singleIssue.serialize();
        res.json(issueDetails);
    });
});

router.post('/', jwtAuth, (req,res) => {
    console.log("POST Route accessed");
    Issue
    .create({
        ticketNumber: req.body.ticketNumber,
        issueSummary: req.body.issueSummary,
        customerImpact: req.body.customerImpact,
        ticketOpenDate: req.body.ticketOpenDate,
        issueFrequency: req.body.issueFrequency,
        affectedTeams: req.body.affectedTeams,
        assignedDevTeam: req.body.assignedDevTeam,
        weeklyPotentialLoss: req.body.weeklyPotentialLoss,
        weeklyTeamCost: getTeamCost(req.body.affectedTeams)*req.body.issueFrequency,
        weeklyTotalCost: getWeeklyTotalCost(req.body.affectedTeams, req.body.weeklyPotentialLoss),
        modifiedBy: req.user.username
    })
    .then(
        issue => res.status(201).json(issue.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//assumes the client will be providing all required frontend fields. Future versions will put in logic
//to address partial updates so this can be outsourced to other frontends

router.put('/:id', jwtAuth, (req,res) => {
    console.log("PUT Route accessed");
    let issueNewDetails = req.body;
    issueNewDetails.weeklyTeamCost = getTeamCost(req.body.affectedTeams);
    issueNewDetails.weeklyTotalCost = getWeeklyTotalCost(req.body.affectedTeams, req.body.issueFrequency, req.body.weeklyPotentialLoss);
    issueNewDetails.modifiedBy = req.user.username;
    
    Issue
    .findByIdAndUpdate (req.params.id, issueNewDetails, {new: true}, (err, issue) => {
        return res.send(issue);
    });
});

router.delete('/:id', jwtAuth, (req,res)=> {
    console.log("DELETE Route accessed");
    Issue.findByIdAndRemove(req.params.id, () =>{
        res.status(200).end();
    });
});

//-- DB Calculations --

function getTeamCost(affectedTeams) {
    let teamCost = 0;

    affectedTeams.map(team => {
        switch (team)
        {
            case "supportTeam1":
                teamCost = teamCost + 100;
                break;

            case "supportTeam2":
                teamCost = teamCost + 200;
                break;

            case "supportTeam3":
                teamCost = teamCost + 300;
                break;

            case "supportTeam4":
                teamCost = teamCost + 400;
                break;

            case "supportTeam5":
                teamCost = teamCost + 500;
                break;
        }
    })
    return teamCost;
}

function getWeeklyTeamCost(affectedTeams, issueFrequency){
    let weeklyTeamCost = getTeamCost(affectedTeams) * issueFrequency;
    return weeklyTeamCost;
}

function getWeeklyTotalCost(affectedTeams, potentialLoss){
    const calculatedTeamCost = getTeamCost(affectedTeams);
    const weeklyTotalCost = calculatedTeamCost + potentialLoss;
    return weeklyTotalCost;
}
//-- Exports --

module.exports = {router};

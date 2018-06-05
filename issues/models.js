"use strict";

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const IssueSchema = mongoose.Schema({
    ticketNumber: {
      type: String,
      required: true,
      unique: true
    },
    issueSummary: {
      type: String,
      required: true
    },
    customerImpact: {
        type: Array,
        required: true
      },
    ticketOpenDate: {
        type: Date,
        required: true
      },
    issueFrequency: {
        type: Number,
        required: true
      },
    affectedTeams: {
        type: Array,
        required: true
      },
    assignedDevTeam: {
        type: String,
        required: true
      },
    weeklyPotentialLoss: {
        type: Number,
        required: true
      },
    weeklyTeamCost: {
      type: Number,
      required: true
    },
    weeklyTotalCost: {
      type: Number,
      required: true
    },
    modifiedBy: {
        type: String,
        required: true
    }
  });

  IssueSchema.methods.serialize = function() {
    return {
        id: this._id || '',
        ticketNumber: this.ticketNumber || '',
        issueSummary: this.issueSummary || '',
        ticketOpenDate: this.ticketOpenDate || '',
        customerImpact: this.customerImpact || '',
        issueFrequency: this.issueFrequency || '',
        affectedTeams: this.affectedTeams || '',
        assignedDevTeam: this.assignedDevTeam || '',
        weeklyPotentialLoss: this.weeklyPotentialLoss || '',
        weeklyTeamCost: this.weeklyTeamCost  || '',
        weeklyTotalCost: this.weeklyTotalCost  || '',
        modifiedBy: this.modifiedBy  || ''
    };
  };
  
  const Issue = mongoose.model('Issue', IssueSchema);
  
  module.exports = {Issue};
"use strict";

jQuery(function($){
	$('.table').footable();
});

const issuesAPIUrl = "/api/issues/";

// $(document).ready(function(){
// //     console.log(localStorage.token);
// //     if (localStorage.token === "undefined") {
// //         console.log("if command read");
// //         window.location.replace("index.html");
// //     }
    
// });


//-- HTML DOM Manipulations --

//updates DOM with a specific issue that has been added, changed, or deleted
//Needs: parse json, run calculations and load into the table
function loadIssue(res){
	console.log("loadIssue function accessed");

	for (let i = 0; i < res.length; i++){
		const simpleDate = convertDate(res[i].ticketOpenDate);
		const weeksOpen = calcWeeksOpen(simpleDate);
		const totalLoss = calcTotalPotentialLoss(res[i].weeklyPotentialLoss, weeksOpen);
		const totalTeamCost = calcTotalTeamCost(res[i].weeklyTeamCost, weeksOpen);
		const totalOverallCost = calcTotalCost(totalLoss, totalTeamCost);
		const customerImpactHtml = createCustImpactHtml(res[i].customerImpact);
		const affectedTeamsHtml = createTeamsHtml(res[i].affectedTeams);
		
		function createCustImpactHtml(issueDetails){
			let custImpactHtml="";
			for (let t = 0; t<issueDetails.length; t++){
				custImpactHtml = custImpactHtml +`<p>${issueDetails[t]}</p>`;
			};
			return custImpactHtml;
		};
		
		function createTeamsHtml(issueDetails){
			let supportTeamHtml="";
			for (let t = 0; t<issueDetails.length; t++){
				supportTeamHtml = supportTeamHtml +`<p>${issueDetails[t]}</p>`;
			};
			return supportTeamHtml;
		};

		$("#dashboard-body").append(
			`<tr>
				<td>${res[i].ticketNumber}</td>
				<td>${res[i].issueSummary}</td>
				<td>${simpleDate}</td>
				<td>${customerImpactHtml}</td>
				<td>${weeksOpen}</td>
				<td>${res[i].issueFrequency}</td>
				<td>${affectedTeamsHtml}</td>
				<td>${res[i].assignedDevTeam}</td>
				<td>${res[i].weeklyPotentialLoss}</td>
				<td>${res[i].weeklyTeamCost}</td>
				<td>${res[i].weeklyTotalCost}</td>
				<td>${totalLoss}</td>
				<td>${totalTeamCost}</td>
				<td>${totalOverallCost}</td>
				<td>${res[i].modifiedBy}</td>
				<td class="text-center"><i class="fas fa-pencil-alt ${res[i].id}"></i><i class="fas fa-trash-alt ml-3 ${res[i].id}"></i></td>
			</tr>`
		);
	};
};

//-- User Actions --

//Create new issue (modal form submitted)
$("#new-issue-form").submit(function(event){
	event.preventDefault();
	console.log("new issue submitted");
	
	let custImpactData = getCustImpactDetails();
	let affectedTeamData = getAffectedTeamData();
	let devTeamData = $('.dev-team').val();

	function getCustImpactDetails(){
		let custImpactArray=[];
		$('.cust-impact:checked').each(function(){
			custImpactArray.push($(this).val());
		});
		return custImpactArray;
	};

	function getAffectedTeamData(){
		let teamArray=[];
		$('.affected-teams:checked').each(function(){
			teamArray.push($(this).val());
		});
		return teamArray;
	};

	let newIssueData = JSON.stringify(
		{ 
		ticketNumber: $('#new-ticket-num').val(),
		issueSummary: $('#new-summary').val(),
		customerImpact: custImpactData,
		ticketOpenDate: $('#new-ticket-date').val(),
		issueFrequency: $('#new-incident-count').val(),
		affectedTeams: affectedTeamData,
		assignedDevTeam: devTeamData,
		weeklyPotentialLoss: $('#new-weekly-loss').val(),
		});

	console.log(newIssueData);
	postNewIssue(newIssueData);
});

//Edit issue (this will create a modal that proprogates the info from an existing issue)
//Edit issue submit confirmation (this will insert html to confirm user wants to submit)
//Edit issue complete (sends put command, closes modal and reloads issues)
//delete issue confirmation (trash can button submitted - this will create a modal asking user to confirm)
//delete issue complete (modal confirmation after trashcan button pushed)

//-- Calculations --
//Convert full date to simple date
function convertDate(originalDate){
	let gmtDate = new Date(originalDate);
	let simpleDate = gmtDate.toLocaleDateString('en-US');
	return simpleDate;
};

// Weeks Open = Current Date - Date Ticket Opened. First converts to milliseconds, then turns the difference into weeks
function calcWeeksOpen(openDate){
	const todaysDate = new Date();
	const todayMs = todaysDate.getTime();
	const openDateMs = Date.parse(openDate);
	const diffMs = todayMs - openDateMs;
	const weeksOpen = Math.ceil(diffMs / 604800000); //ms in a week
	return weeksOpen;
};
// Total Potential Loss = Weekly Potential Loss x Weeks Open
function calcTotalPotentialLoss(weeklyLoss, timeOpen){
	const totalPotentialLoss = weeklyLoss * timeOpen;
	return totalPotentialLoss;
};
// Total Team Cost = Weekly Team Cost x Weeks Open
function calcTotalTeamCost(weeklyTeamCost, timeOpen){
	const totalTeamCost = weeklyTeamCost * timeOpen;
	return totalTeamCost;
};
// Total Cost Since Reported = Total Potential Loss + Total Team Cost
function calcTotalCost(totalLoss, teamCostTotal){
	const totalCost = totalLoss + teamCostTotal;
	return totalCost;
};


//-- API CALLS --
//calls all open issues in DB
function getAllIssues(){
    console.log (`getAllIssues function accessed`);

	$.ajax({
		type: "GET",
        url: issuesAPIUrl,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		success: function (res) {
			loadIssue(res);
		},
		contentType : "application/json"
	});
};

//creates new issue
function postNewIssue(newIssueData){
    console.log (`postNewIssue function accessed`);

	$.ajax({
        type: "POST",
        data: newIssueData,
        url: issuesAPIUrl,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		success: function(res){
			$('#add-new-issue').modal('hide');
			$('#add-new-issue').on('hidden.bs.modal', function () {
				$(this).find('form').trigger('reset');
			});
			console.log(res);
			getAllIssues();
		},
		dataType: "json",
		contentType : "application/json"
	});
};

//updates a particular issue

function updateIssue(updatedIssueData){
    console.log (`updateIssue function accessed`);

	$.ajax({
        type: "PUT",
        data: updatedIssueData,
        url: issuesAPIUrl + ":" + updatedIssueData.id,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		success: loadIssue(),//may change
		dataType: "json",
		contentType : "application/json"
	});
};
//deletes issue - pull whole table again (easier/more proper solution) or remove it via html, trusting it worked (not as a great idea)

function deleteIssue(deletedIssueId){
    console.log (`deleteIssue function accessed`);

	$.ajax({
        type: "DELETE",
        url: issuesAPIUrl + ":" + deletedIssueId,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		success: getAllIssues(),
		dataType: "json",
		contentType : "application/json"
	});
};

getAllIssues();
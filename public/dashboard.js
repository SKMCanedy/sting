"use strict";

jQuery(function($){
	$('.table').footable();
});

const issuesAPIUrl = "/api/issues/";

function loadPage(){//need better auth check here
	if (localStorage.token === "undefined") {
        window.location.replace("index.html");
    }
	else {
		getAllIssues();
	}
}


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
				<td class="text-left">${res[i].ticketNumber}</td>
				<td>${res[i].issueSummary}</td>
				<td>${simpleDate}</td>
				<td>${customerImpactHtml}</td>
				<td>${weeksOpen}</td>
				<td>${res[i].issueFrequency}</td>
				<td>${affectedTeamsHtml}</td>
				<td>${res[i].assignedDevTeam}</td>
				<td>$${res[i].weeklyPotentialLoss}</td>
				<td>$${res[i].weeklyTeamCost}</td>
				<td>$${res[i].weeklyTotalCost}</td>
				<td>$${totalLoss}</td>
				<td>$${totalTeamCost}</td>
				<td>$${totalOverallCost}</td>
				<td>${res[i].modifiedBy}</td>
				<td>
				<button type="button" class="edit-button" value="${res[i].id}"><i class="fas fa-pencil-alt"></i></button>
				<button type="button" class="delete-button" value="${res[i].id}"><i class="fas fa-trash-alt"></i></button>
				</td>
			</tr>`
		);
	};
};

//alerts user if they are attemmpting to add an issue already in the database
function insertDuplicateIssueHtml(){
	console.log("insertDuplicateIssueHtml function accessed");
	$(".dup-issue-warning").html(
		"   ! Issue already exists !"
	);
};

//removes duplicate alert
function removeDuplicateIssueHtml(){
	$(".dup-issue-warning").html("");
}

//-- User Actions --

//Create Issue - Modal is controlled by existing HTML. This submits values to POST route
$("#issue-details").submit(function(event){
	event.preventDefault();
	console.log("new issue submitted");
	
	let custImpactData = getCustImpactDetails();
	let affectedTeamData = getAffectedTeamData();

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
		issueFrequency: parseInt($('#new-incident-count').val()),
		affectedTeams: affectedTeamData,
		assignedDevTeam: $('.dev-team').val(),
		weeklyPotentialLoss: parseInt($('#new-weekly-loss').val())
		});
	
	removeDuplicateIssueHtml();
	
	postNewIssue(newIssueData);
});

//Edit - pulls issue ID and calls GET connection
$(document).on("click", ".edit-button", function(event){
	const issueId = $(this).val();
	getSingleIssue(issueId);
});

//Edit - creates modal and inserts info returned from GET route
function editIssueModal (issueInfo){//Need: insert logic for affected teams & assigned dev team
	const standardFormatDate = new Date(issueInfo.ticketOpenDate).toISOString().slice(0,10);

	function loadEditModalHtml() {
		$("#edit-issue-body").html(
			`
			<form id="edit-issue-form">
				<div class="form-group">
					<label for="edit-ticket-num" class="font-weight-bold">Ticket Number</label>
					<input type="text" class="form-control" id="edit-ticket-num" value="${issueInfo.ticketNumber}">
				</div>
				<div class="form-group">
					<label for="new-summary"class="font-weight-bold">Issue Summary</label>
					<input type="textarea" class="form-control" id="edit-summary" value="${issueInfo.issueSummary}">
				</div>
				<div class="form-group">
					<fieldset>
						<p class="font-weight-bold">Customer Impact</p>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-cust-impact" type="checkbox" id="edit-impactArea1" value="Impact Area 1">
							<label class="form-check-label" for="edit-impactArea1">Impact Area 1</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-cust-impact" type="checkbox" id="edit-impactArea2" value="Impact Area 2">
							<label class="form-check-label" for="edit-impactArea2">Impact Area 2</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-cust-impact" type="checkbox" id="edit-impactArea3" value="Impact Area 3">
							<label class="form-check-label" for="edit-impactArea3">Impact Area 3</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-cust-impact" type="checkbox" id="edit-impactArea4" value="Impact Area 4">
							<label class="form-check-label" for="edit-impactArea4">Impact Area 4</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-cust-impact" type="checkbox" id="edit-impactArea5" value="Impact Area 5">
							<label class="form-check-label" for="edit-impactArea5">Impact Area 5</label>
						</div>
					</fieldset>
				</div>
				<div class="form-group">
					<label for="edit-ticket-date" class="font-weight-bold">Date Ticket Opened</label>
					<input type="date" class="form-control" id="edit-ticket-date" value="${standardFormatDate}">
				</div>
				<div class="form-group">
					<label for="edit-incident-count" class="font-weight-bold">Incidents per Week</label>
					<input type="number" class="form-control" id="edit-incident-count" value="${issueInfo.issueFrequency}">
				</div>
				<div class="form-group">
				<fieldset>
						<p class="font-weight-bold">Affected Teams</p>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-affected-teams" type="checkbox" id="edit-team1" value="supportTeam1">
							<label class="form-check-label" for="edit-team1">Support Team 1</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-affected-teams" type="checkbox" id="edit-team2" value="supportTeam2">
							<label class="form-check-label" for="edit-team2">Support Team 2</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-affected-teams" type="checkbox" id="edit-team3" value="supportTeam3">
							<label class="form-check-label" for="edit-team3">Support Team 3</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-affected-teams" type="checkbox" id="edit-team4" value="supportTeam4">
							<label class="form-check-label" for="edit-team4">Support Team 4</label>
						</div>
						<div class="form-check form-check-inline">
							<input class="form-check-input edit-affected-teams" type="checkbox" id="edit-team5" value="supportTeam5">
							<label class="form-check-label" for="edit-team5">Support Team 5</label>
						</div>
					</fieldset>
				</div>
				<div class="form-group">
					<fieldset>
						<p class="font-weight-bold">Assigned Dev Team</p>
						<select class="custom-select edit-dev-team">
							<option>Choose...</option>
							<option value="Dev Team 1" id="edit-dev-team1">Dev Team 1</option>
							<option value="Dev Team 2" id="edit-dev-team2">Dev Team 2</option>
							<option value="Dev Team 3" id="edit-dev-team3">Dev Team 3</option>
							<option value="Other" id="edit-dev-team4">Other</option>
							<option value="None" id="edit-dev-team5">None</option>
						</select>
					</fieldset>
				</div>
				<div class="form-group">
					<label for="edit-new-weekly-loss" class="font-weight-bold">Weekly Potential Loss</label>
					<input type="number" class="form-control" id="edit-weekly-loss" value="${issueInfo.weeklyPotentialLoss}">
				</div>
				<div id="edit-confirmation"></div>
				<div id="edit-form-buttons" class="text-center">
					<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-primary" id="edit-submit-button" value="${issueInfo.id}">Edit Issue</button>
				</div>
			</form>
	
			`)
	};

	function findImpactAreas(){
		$(issueInfo.customerImpact).each(function(){
			for (let i=1; i<=5; i++){
				let impactArea=("#edit-impactArea"+i);
				if (this == ("Impact Area " + i)){
					$(impactArea).prop("checked", true);
				};
			};
		});
	};

	function findAffectedTeams(){
		$(issueInfo.affectedTeams).each(function(){
			for (let i=1; i<=5; i++){
				let affectedTeam=("#edit-team"+i);
				if (this == ("supportTeam" + i)){
					$(affectedTeam).prop("checked", true);
				};
			};
		});
	};

	function findDevTeam(){
		switch (issueInfo.assignedDevTeam)
        {
            case "Dev Team 1":
				$("#edit-dev-team1").prop("selected", true);
                break;

            case "Dev Team 2":
				$("#edit-dev-team2").prop("selected", true);
                break;

            case "Dev Team 3":
				$("#edit-dev-team3").prop("selected", true);
                break;

            case "Other":
				$("#edit-dev-team4").prop("selected", true);
                break;

            case "None":
				$("#edit-dev-team5").prop("selected", true);
				break;
		}
	}
	

	function showModal(){
		$('#edit-issue-modal').modal('show');
	};

	loadEditModalHtml();
	findImpactAreas();
	findAffectedTeams();
	findDevTeam();
	showModal();
}

//Edit - submit confirmation (this will insert html to confirm user wants to submit)
$(document).on("click", "#edit-submit-button", function(event){
	event.preventDefault();
	$("#edit-form-buttons").addClass("collapse")
	$("#edit-confirmation").html(
		`
		<p class="text-danger">Are you sure you want to commit these changes?</p>
		<div id="edit-confirmation-buttons" class="text-center">
			<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
			<button type="submit" class="btn btn-primary" id="edit-confirm-button">Confirm Changes</button>
		</div>
		`
	)
});

//Edit - confirmed edit runs POST
$(document).on("click", "#edit-confirm-button", function(event){
	console.log("Confirm edit clicked");
	event.preventDefault();
	let custImpactData = getCustImpactDetails();
	let affectedTeamData = getAffectedTeamData();
	let issueId = $("#edit-submit-button").val();


	function getCustImpactDetails(){
		let custImpactArray=[];
		$('.edit-cust-impact:checked').each(function(){
			custImpactArray.push($(this).val());
		});
		return custImpactArray;
	};

	function getAffectedTeamData(){
		let teamArray=[];
		$('.edit-affected-teams:checked').each(function(){
			teamArray.push($(this).val());
		});
		return teamArray;
	};

	let editIssueData = JSON.stringify(
		{ 
		ticketNumber: $('#edit-ticket-num').val(),
		issueSummary: $('#edit-summary').val(),
		customerImpact: custImpactData,
		ticketOpenDate: $('#edit-ticket-date').val(),
		issueFrequency: parseInt($('#edit-incident-count').val()),
		affectedTeams: affectedTeamData,
		assignedDevTeam: $('.edit-dev-team').val(),
		weeklyPotentialLoss: parseInt($('#edit-weekly-loss').val())
		});
	updateIssue(editIssueData,issueId);
});

//DELETE -   confirmation (trash can button submitted - this will create a modal asking user to confirm)
$(document).on("click", ".delete-button", function(event){
	let issueId = $(this).val();
	console.log(issueId);
	getDeleteConfirm(issueId);
});
//DELETE - executed (modal confirmation after trashcan button pushed)
function getDeleteConfirm(issueId){
	$('#delete-confirm-modal').modal('show');
	$(document).on("click", "#delete-confirm-button", function(event){
		event.preventDefault();
		deleteIssue(issueId);
		$('#delete-confirm-modal').modal('hide');
		location.reload(true);
	});
}

//LOG OUT

$("#log-out-button").click(function(){
	localStorage.setItem('token', undefined);
	window.location.replace("index.html");
});

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

//gets info for a single issue w/intent to edit
function getSingleIssue(issueId){
    console.log (`getSingleIssue function accessed`);
	console.log (issueId);
	$.ajax({
		type: "GET",
        url: issuesAPIUrl + issueId,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		success: function (res) {
			console.log(res);
			editIssueModal(res);
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
			$('#issue-details').modal('hide');
			$('#issue-details').on('hidden.bs.modal', function () {
				$(this).find('form').trigger('reset');
			});
			location.reload();
		},
		error: function(res){
			console.log(res);
			if (res.responseJSON.message == "Duplicate Ticket Number"){
				insertDuplicateIssueHtml();
			};
		},
		dataType: "json",
		contentType : "application/json"
	});
};

//updates a particular issue

function updateIssue(updatedIssueData,issueId){
	console.log (`updateIssue function accessed`);
	console.log(issueId);

	$.ajax({
        type: "PUT",
        data: updatedIssueData,
        url: issuesAPIUrl + issueId,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		success: function(res){
			$('#edit-issue-modal').modal('hide');
			location.reload(true)
		},
		dataType: "json",
		contentType : "application/json"
	});
};

//deletes issue 
function deleteIssue(deletedIssueId){
	console.log (`deleteIssue function accessed`);
	console.log(deletedIssueId)

	$.ajax({
        type: "DELETE",
        url: issuesAPIUrl + deletedIssueId,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
		dataType: "json",
		contentType : "application/json"
	});
};

loadPage();
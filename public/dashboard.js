"use strict";

//--## Global Variables --

const issuesAPIUrl = "/api/issues/";

const tableHeaders = [
	{
        "name": "expand",
		"title": "",
		"filterable": false,
		"sortable": false
    },
    {
        "name": "ticketNumber",
		"title": "Issue Ticket Number",
		"type": "text"
    },
    {
        "name": "issueSummary",
		"title": "Issue Summary",
		"type": "text",
        "breakpoints":"xxs xs"
    },
    {
        "name": "ticketOpenDate",
		"title": "Date Ticket Opened",
		"type": "date",
        "breakpoints": "xxs xs sml med lar xl"
    },
    {
        "name": "customerImpact",
        "title": "Customer Impact",
        "breakpoints": "xxs xs sml med"
    },
    {
        "name": "weeksOpen",
		"title": "Weeks Open",
		"type": "number"
    },
    {
        "name": "issueFrequency",
		"title": "Incidents per Week",
		"type": "number",
        "breakpoints": "xxs xs sm"
    },
    {
        "name": "affectedTeams",
        "title": "Affected Teams",
        "breakpoints": "xxs xs sml med lar"
    },
    {
        "name": "assignedDevTeam",
		"title": "Assigned Dev Team",
		"type": "text",
        "breakpoints": "xxs xs"
    },
    {
        "name": "weeklyPotentialLoss",
		"title": "Weekly Potential Loss($)",
		"type": "number",
        "breakpoints": "xxs xs sml med lar xl"
    },
    {
        "name": "weeklyTeamCost",
		"title": "Weekly Team Cost($)",
		"type": "number",
        "breakpoints": "xxs xs sml med lar xl"
    },
    {
        "name": "weeklyTotalCost",
		"title": "Weekly Total Cost($)",
		"type": "number",
        "breakpoints": "xxs xs sml"
    },
    {
        "name": "totalLoss",
		"title": "Total Potential Loss($)",
		"type": "number",
        "breakpoints": "xxs xs sml med lar xl"
    },
    {
        "name": "totalTeamCost",
		"title": "Total Team Cost($)",
		"type": "number",
        "breakpoints": "xxs xs sml med lar xl"
    },
    {
        "name": "totalOverallCost",
		"title": "Overall Cost($)",
		"type": "number",
    },
    {
        "name": "modifiedBy",
		"title": "Last Modified By",
		"type": "text",
        "breakpoints": "xxs xs sml med lar"
    },
    {
        "name": "actions",
        "title": "Actions",
		"breakpoints": "xxs xs sml",
		"filterable": false,
		"sortable": false,
		"style": {
			"width": 100,
			}
    }
];


function loadPage(){
	if (localStorage.token === "undefined") {
        window.location.replace("index.html");
    }
	else {
        getAllIssues()
	}
}

//--## HTML DOM Manipulations --

//loads dashboard table; called after app gets issues and calculates additional values

function loadTable(tableRows){
    FooTable.init(".main-table", {
        "columns": tableHeaders,
		"rows": tableRows,
		"breakpoints": {
			"xxs": 480,
			"xs": 600,
			"sml": 768,
			"med": 992,
			"lar": 1200,
			"xl": 1400
		}
	});
};


//alerts user if they are attemmpting to add an issue already in the database

function validationError(inputArea){
	switch (inputArea)
	{
		case "dup-ticket-number":
			$(".dup-issue-warning").html(
				"   ! Issue already exists"
			);
			break;
		
		case "missing-ticket-number":
		$(".ticket-number-warning").html(
			"   ! Please provide a Ticket Number"
		);
		break;
		
		case "issue-summary":
			$(".issue-summary-warning").html(
				"   ! Please provide an Issue Summary"
			);
			break;

		case "customer-impact":
			$(".cust-impact-warning").html(
				"   ! Please choose at least one"
			);
			break;
		
		case "frequency":
			$(".frequency-warning").html(
				"   ! Please enter a number"
			);
			break;

		case "affected-teams":
			$(".affected-teams-warning").html(
				"   ! Please choose at least one"
			);
			break;
		
		case "dev-team":
			$(".dev-team-warning").html(
				"   ! Please choose a valid option"
			);
			break;
		
		case "weekly-loss":
			$(".weekly-loss-warning").html(
				"   ! Please enter a number"
			);
			break;

		case "clear":
			$(".warning").html("")
	}
}

//--## User Actions --

//Create Issue - Modal is controlled by existing HTML. This submits values to POST route
$("#issue-details").submit(function(event){
	event.preventDefault();
	
	let custImpactData = getCustImpactDetails();
	let affectedTeamData = getAffectedTeamData();

	function getCustImpactDetails(){
		let custImpactArray=[];
		$(".cust-impact:checked").each(function(){
			custImpactArray.push($(this).val());
		});
		return custImpactArray;
	};

	function getAffectedTeamData(){
		let teamArray=[];
		$(".affected-teams:checked").each(function(){
			teamArray.push($(this).val());
		});
		return teamArray;
	};

	validationError("clear");
 

	if (custImpactData.length === 0 ){
		validationError("customer-impact");		
	} else if (affectedTeamData.length === 0) {
		validationError("affected-teams");
	} else if ($(".dev-team").val() === "default"){
		validationError("dev-team");
	} else {
		let newIssueData = JSON.stringify(
			{ 
			ticketNumber: $("#new-ticket-num").val(),
			issueSummary: $("#new-summary").val(),
			customerImpact: custImpactData,
			ticketOpenDate: $("#new-ticket-date").val(),
			issueFrequency: parseInt($("#new-incident-count").val()),
			affectedTeams: affectedTeamData,
			assignedDevTeam: $(".dev-team").val(),
			weeklyPotentialLoss: parseInt($("#new-weekly-loss").val())
			});
		postNewIssue(newIssueData);
	}
});

//Edit Issue - pulls issue ID and calls GET connection
$(document).on("click", ".edit-button", function(event){
	const issueId = $(this).val();
	getSingleIssue(issueId);
});

//Edit Issue - creates modal and inserts info returned from GET route
function editIssueModal (issueInfo){
	const standardFormatDate = new Date(issueInfo.ticketOpenDate).toISOString().slice(0,10);

	function loadEditModalHtml() {
		$("#edit-issue-body").html(
			`
			<form id="edit-issue-form">
				<div class="form-group">
					<label for="edit-ticket-num" class="font-weight-bold">Ticket Number</label><span class="text-danger dup-issue-warning warning font-weight-bold"></span>
					<input type="text" class="form-control " id="edit-ticket-num" value="${issueInfo.ticketNumber}" required>
				</div>
				<div class="form-group">
					<label for="edit-summary" class="font-weight-bold">Issue Summary</label><span class="issue-summary-warning warning text-danger font-weight-bold"></span>
					<textarea class="form-control" id="edit-summary" rows="3" required>${issueInfo.issueSummary}</textarea>
				</div>
				<div class="form-group">
					<fieldset>
						<p class="font-weight-bold">Customer Impact<span class="cust-impact-warning warning text-danger"></span></p>
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
					<input type="date" class="form-control" id="edit-ticket-date" value="${standardFormatDate}" required>
				</div>
				<div class="form-group">
					<label for="edit-incident-count" class="font-weight-bold">Incidents per Week</label><span class="text-danger frequency-warning warning font-weight-bold"></span>
					<input type="number" class="form-control" id="edit-incident-count" value="${issueInfo.issueFrequency}" required>
				</div>
				<div class="form-group">
				<fieldset>
						<p class="font-weight-bold">Affected Teams<span class="affected-teams-warning warning text-danger"></span></p>
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
						<p class="font-weight-bold">Assigned Dev Team<span class="dev-team-warning warning text-danger font-weight-bold"></span></p>
						<select class="custom-select edit-dev-team" aria-label="Dev teams options>
							<option value="default">Choose...</option>
							<option value="Dev Team 1" id="edit-dev-team1">Dev Team 1</option>
							<option value="Dev Team 2" id="edit-dev-team2">Dev Team 2</option>
							<option value="Dev Team 3" id="edit-dev-team3">Dev Team 3</option>
							<option value="Other" id="edit-dev-team4">Other</option>
							<option value="None" id="edit-dev-team5">None</option>
						</select>
					</fieldset>
				</div>
				<div class="form-group">
					<label for="edit-new-weekly-loss" class="font-weight-bold">Weekly Potential Loss</label><span class="text-danger weekly-loss-warning warning font-weight-bold"></span>
					<input type="number" class="form-control" id="edit-weekly-loss" value="${issueInfo.weeklyPotentialLoss}" required aria-label="weekly loss">
				</div>
				<div id="edit-confirmation"></div>
				<div id="edit-form-buttons" class="text-center">
					<button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Cancel">Cancel</button>
					<button type="submit" class="btn btn-primary" id="edit-submit-button" value="${issueInfo.id}" aria-label="Edit">Edit Issue</button>
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
		$("#edit-issue-modal").modal("show");
	};

	loadEditModalHtml();
	findImpactAreas();
	findAffectedTeams();
	findDevTeam();
	showModal();
}

//Edit Issue - submit confirmation (this will insert html to confirm user wants to submit)
$(document).on("click", "#edit-submit-button", function(event){
	event.preventDefault();
	$("#edit-form-buttons").addClass("collapse")
	$("#edit-confirmation").html(
		`
		<p class="text-danger">Are you sure you want to commit these changes?</p>
		<div id="edit-confirmation-buttons" class="text-center">
			<button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Cancel">Cancel</button>
			<button type="submit" class="btn btn-primary" id="edit-confirm-button" aria-label="Confirm Changes">Confirm Changes</button>
		</div>
		`
	)
});

//Edit Issue - confirmed. runs PUT
$(document).on("click", "#edit-confirm-button", function(event){
	event.preventDefault();
	let custImpactData = getCustImpactDetails();
	let affectedTeamData = getAffectedTeamData();
	let issueId = $("#edit-submit-button").val();


	function getCustImpactDetails(){
		let custImpactArray=[];
		$(".edit-cust-impact:checked").each(function(){
			custImpactArray.push($(this).val());
		});
		return custImpactArray;
	};

	function getAffectedTeamData(){
		let teamArray=[];
		$(".edit-affected-teams:checked").each(function(){
			teamArray.push($(this).val());
		});
		return teamArray;
	};

	validationError("clear");

	//Will need to clean up in phase two. Possible put into object literal and iterate over it
	if ($("#edit-ticket-num").val() === ""){
		validationError("missing-ticket-number");
	} else if ($("#edit-summary").val() === ""){
		validationError("issue-summary");
	} else if (custImpactData.length === 0 ){
		validationError("customer-impact");		
	} else if ($("#edit-incident-count").val() === ""){
		validationError("frequency");
	} else if (affectedTeamData.length === 0) {
		validationError("affected-teams");
	} else if ($(".edit-dev-team").val() === "default"){
		validationError("dev-team");
	} else if ($("#edit-weekly-loss").val() === ""){
		validationError("weekly-loss");
	} else {
		let editIssueData = JSON.stringify(
			{ 
			ticketNumber: $("#edit-ticket-num").val(),
			issueSummary: $("#edit-summary").val(),
			customerImpact: custImpactData,
			ticketOpenDate: $("#edit-ticket-date").val(),
			issueFrequency: parseInt($("#edit-incident-count").val()),
			affectedTeams: affectedTeamData,
			assignedDevTeam: $(".edit-dev-team").val(),
			weeklyPotentialLoss: parseInt($("#edit-weekly-loss").val())
			});
		updateIssue(editIssueData,issueId);
	}
});

//DELETE Issue -   confirmation (trash can button submitted - this will create a modal asking user to confirm)
$(document).on("click", ".delete-button", function(event){
	let issueId = $(this).val();
	getDeleteConfirm(issueId);
});
//DELETE Issue - executed (modal confirmation after trashcan button pushed)
function getDeleteConfirm(issueId){
	$("#delete-confirm-modal").modal("show");
	$(document).on("click", "#delete-confirm-button", function(event){
		event.preventDefault();
		deleteIssue(issueId);
		$("#delete-confirm-modal").modal("hide");
		location.reload(true);
	});
}

//LOG OUT

$("#log-out-button").click(function(){
	localStorage.setItem("token", undefined);
	window.location.replace("index.html");
});

//--## Calculations --

//Convert full date to simple date
function convertDate(originalDate){
	let gmtDate = new Date(originalDate);
	let simpleDate = gmtDate.toLocaleDateString("en-US");
	return simpleDate;
};

// Weeks Open = Current Date - Date Ticket Opened. First converts to milliseconds, then turns the difference into weeks
function calcWeeksOpen(openDate){
	const todayLongDate = new Date(); //gets todays date
	const todaysDate = convertDate(todayLongDate) //converts to same format as incoming date
	const todayMs = Date.parse(todaysDate); //turn into ms
	const openDateMs = Date.parse(openDate);
	const diffMs = todayMs - openDateMs;
	const weeksOpen = Math.ceil(diffMs / 604800000); //ms to week; user request to roundup
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

//Calculates fields not in database and returns data to propagate rows
function calcFields(res){
	for (let i = 0; i < res.length; i++){
		const simpleDate = convertDate(res[i].ticketOpenDate);
		const weeksOpen = calcWeeksOpen(simpleDate);
		const totalLoss = calcTotalPotentialLoss(res[i].weeklyPotentialLoss, weeksOpen);
		const totalTeamCost = calcTotalTeamCost(res[i].weeklyTeamCost, weeksOpen);
		const totalOverallCost = calcTotalCost(totalLoss, totalTeamCost);
		const customerImpactHtml = createCustImpactHtml(res[i].customerImpact);
        const affectedTeamsHtml = createTeamsHtml(res[i].affectedTeams);
        const actions = `
            <button type="button" class="btn edit-button action-button" value="${res[i].id}"><span class="fas fa-pencil-alt" title="Edit" aria-label="Edit"></span></button>
            <button type="button" class="btn delete-button action-button" value="${res[i].id}"><span class="fas fa-trash-alt" title="Delete" aria-label="Delete"></span></button>`;
		
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

        //update object to include calculated values 
        res[i].ticketOpenDate = simpleDate;
        res[i].weeksOpen = weeksOpen;
        res[i].totalLoss = totalLoss;
        res[i].totalTeamCost = totalTeamCost;
        res[i].totalOverallCost = totalOverallCost;
        res[i].customerImpact = customerImpactHtml;
        res[i].affectedTeams = affectedTeamsHtml;
        res[i].actions = actions;
        res[i].expand = "";
    };
	loadTable(res);
	loadSummaryTable(res);
};

function loadSummaryTable(res){
	const sumTableData = calcSummary(res);

	$("#weekly-team").html(`$ ${sumTableData.weeklyTeam}`);
	$("#weekly-loss").html(`$ ${sumTableData.weeklyLoss}`);
	$("#weekly-total").html(`$ ${sumTableData.weeklyTotal}`);
	$("#total-team").html(`$ ${sumTableData.totalTeam}`);
	$("#total-loss").html(`$ ${sumTableData.totalLoss}`);
	$("#overall-cost").html(`$ ${sumTableData.overallTotal}`);

}

function calcSummary(res){
	
	let summaryTotals = {
		"weeklyTeam": 0,
		"weeklyLoss": 0,
		"weeklyTotal": 0,
		"totalTeam": 0,
		"totalLoss": 0,
		"overallTotal": 0
	}

	for (let i=0; i<res.length; i++){
		summaryTotals.weeklyTeam += res[i].weeklyTeamCost;
		summaryTotals.weeklyLoss += res[i].weeklyPotentialLoss;
		summaryTotals.weeklyTotal += res[i].weeklyTotalCost;
		summaryTotals.totalTeam += res[i].totalTeamCost;
		summaryTotals.totalLoss += res[i].totalLoss;
		summaryTotals.overallTotal += res[i].totalOverallCost;
	}

	return summaryTotals;
}
//--## API CALLS --

//calls all issues in DB
function getAllIssues(){
	$.ajax({
		type: "GET",
        url: issuesAPIUrl,
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
		success: function (res) {
			calcFields(res);
		},
		contentType : "application/json"
	});
};

//gets info for a single issue w/intent to edit
function getSingleIssue(issueId){
	$.ajax({
		type: "GET",
        url: issuesAPIUrl + issueId,
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
		success: function (res) {
			editIssueModal(res);
		},
		contentType : "application/json"
	});
};

//creates new issue
function postNewIssue(newIssueData){
	$.ajax({
        type: "POST",
        data: newIssueData,
        url: issuesAPIUrl,
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
		success: function(res){
			$("#issue-details").modal("hide");
			$("#issue-details").on("hidden.bs.modal", function () {
				$(this).find("form").trigger("reset");
			});
			location.reload();
		},
		error: function(res){
			if (res.responseJSON.message == "Duplicate Ticket Number"){
				validationError("dup-ticket-number")
			};
		},
		dataType: "json",
		contentType : "application/json"
	});
};

//updates a particular issue

function updateIssue(updatedIssueData,issueId){
	$.ajax({
        type: "PUT",
        data: updatedIssueData,
        url: issuesAPIUrl + issueId,
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
		success: function(res){
			$("#edit-issue-modal").modal("hide");
			location.reload();
		},
		error: function(res){
			if (res.responseJSON.message == "Duplicate Ticket Number"){
				validationError("dup-ticket-number", )
			};
		},
		dataType: "json",
		contentType : "application/json"
	});
};

//deletes issue 
function deleteIssue(deletedIssueId){
	$.ajax({
        type: "DELETE",
        url: issuesAPIUrl + deletedIssueId,
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
		dataType: "json",
		contentType : "application/json"
	});
};

loadPage();
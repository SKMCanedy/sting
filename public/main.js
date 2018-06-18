"use strict";

const newUserUrl = "/api/users/";
const loginUrl = "/api/auth/login"

//New User Create
$("#new-user-submit").submit(function(event){
	event.preventDefault();
	console.log("New user form submitted");
	clearDupUserHtml();

	let formDataJson = JSON.stringify(
		{ 
		firstName: $('#acct-create-firstName').val(),
		lastName: $('#acct-create-lastName').val(),
		username: $('#acct-create-username').val(),
		password: $('#acct-create-password').val()
		});

	//put this into a separate function
	$.ajax({
		type: "POST",
		url: newUserUrl,
		data: formDataJson,
		success: function(res){
			hideNewUserModal();
			showUserCreateSuccess();
		},
		error: function(res){
			console.log(res.responseJSON.message);
			if (res.responseJSON.message === "Username already taken"){
				insertDupUserHtml();
			}
		},
		dataType: "json",
		contentType : "application/json"
	});
});

//Login Submission
$("#login-form").submit(function(event){
	event.preventDefault();
	console.log("login form submitted");
	
	let loginDataJson = JSON.stringify(
		{ 
		username: $('#login-username').val(),
		password: $('#login-pw').val()
		});
	
	clearUnauthorizedHtml();

	$.ajax({
		type: "POST",
		url: loginUrl,
		data: loginDataJson,
		success: function(res){
			localStorage.setItem('token', res.authToken);
			window.location.replace("dashboard.html");
		},
		error: function(res){
			console.log(res);
			if(res.responseText === "Unauthorized"){
				clearLoginForm();
				insertUnauthorizedHtml();
				$("#login-username").focus();
			}
		},
		dataType: "json",
		contentType : "application/json"
	});
});


//DOM Manipulations


function insertDupUserHtml(){
	$("#username-alert").html(
		` Username already taken. Please choose another username and try again.`
	);
}

function clearDupUserHtml(){
	$("#username-alert").html("");
}

function insertUnauthorizedHtml(){
	$("#login-error").html(
		`Invalid Username and/or Password. Please try again.`
	);
};

function clearUnauthorizedHtml(){
	$("#login-error").html("");
}


function hideNewUserModal(){
	$('#account-create').modal('hide');
	$('#account-create').on('hidden.bs.modal', function () {
		$(this).find('form').trigger('reset');
	});
}

function showUserCreateSuccess(){
	$('#account-success').modal('show');
}

function clearLoginForm(){
	$('#login-form').trigger('reset');
}
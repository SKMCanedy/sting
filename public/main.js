"use strict";

const newUserUrl = "/api/users/";
const loginUrl = "/api/auth/login"

//New User Create
$("#new-user-submit").submit(function(event){
	event.preventDefault();
	console.log("New user form submitted");
	
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
			console.log(res); //next steps can go here
		},
		dataType: "json",
		contentType : "application/json"
	});
});

//Login
$("#login-form").submit(function(event){
	event.preventDefault();
	console.log("login form submitted");
	
	let loginDataJson = JSON.stringify(
		{ 
		username: $('#login-username').val(),
		password: $('#login-pw').val()
		});

	//put this into a separate function
	$.ajax({
		type: "POST",
		url: loginUrl,
		data: loginDataJson,
		success: function(res){
			localStorage.setItem('token', res.authToken);
			window.location.replace("dashboard.html");
		},
		dataType: "json",
		contentType : "application/json"
	});
});


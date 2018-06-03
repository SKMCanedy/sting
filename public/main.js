"use strict";

const newUserUrl = "/api/users/";
const loginUrl = "/api/auth/login"

jQuery(function($){
	$('.table').footable();
});


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
	
	console.log(loginDataJson);
	console.log(loginUrl);

	//put this into a separate function
	$.ajax({
		type: "POST",
		url: loginUrl,
		data: loginDataJson,
		success: function(res){
			console.log(res); //next steps can go here
			localStorage.setItem('token', res.authToken);
		},
		dataType: "json",
		contentType : "application/json"
	});
});


// headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//clean up some new user stuff
//try to connect login & get token response
//try to add protected routes
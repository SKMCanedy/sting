"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const Joi = require("joi");

const {User} = require("./models");

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res) => {
    //validation schema
    const userSchema = {
        firstName: Joi.string().min(2).trim().required(),
        lastName: Joi.string().min(2).trim().required(),
        username: Joi.string().min(3).regex(/^[A-Za-z0-9_]+$/).required(),
        password: Joi.string().min(10).max(72).regex(/^[A-Za-z0-9_!@$]+$/).required()
    };

    const userInput = req.body;
    
    const result = Joi.validate(userInput, userSchema);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    };

    let trimmedInput = result.value;

    let { username, password, firstName, lastName } = trimmedInput;
    console.log(username, password, firstName, lastName);

    return User.find({username})
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: "ValidationError",
                    message: "Username already taken",
                    location: "username"
                });
            console.log(count);
            };

            let hashPw = User.hashPassword(password);
            console.log(hashPw);
            return hashPw;
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());//what is happening here? calling the serialize method in models.js which compiles the user info into a json to return in a response?
        })
        .catch(err => { //Joi returns it's own error above. Is there anything i need to do here in the catch to address Joi? 
            if (err.reason === 'ValidationError'){
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: "Internal Server Error"});
        });
});

module.exports = {router};

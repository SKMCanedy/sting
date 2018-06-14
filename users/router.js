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
        password: Joi.string().min(3).max(72).regex(/^[A-Za-z0-9_!@$]+$/).required()
    };

    const userInput = req.body;
    
    const result = Joi.validate(userInput, userSchema);

    if (result.error) {
        res.status(400).json({"message": result.error.details[0].message});
        return;
    };

    let trimmedInput = result.value;

    let { username, password, firstName, lastName } = trimmedInput;

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
            };

            let hashPw = User.hashPassword(password);
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
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError'){
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: "Internal Server Error"});
        });
});

module.exports = {router};

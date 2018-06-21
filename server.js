"use strict";

require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
const passport = require('passport');
const jsonParser = bodyParser.json();

const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require('./config');

const { router: usersRouter } = require("./users");
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: issueRouter } = require("./issues");

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(jsonParser);

app.use("/api/users/", usersRouter);
app.use("/api/auth/", authRouter);
app.use("/api/issues/", issueRouter);

app.use(express.static("public"), function (req,res){
    res.sendStatus(200);
})

// Logging
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
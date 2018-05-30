"use strict";

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const router = express.Router();
const { PORT, DATABASE_URL } = require('./config');

const { router: usersRouter } = require("./users"); //need this explained. is it like this? use "usersRouter" from the router reference in the users/index.js file. the router reference goes to the users/router.js file. usersRouter is actually "router" which is an express export so if called, run all functions that use the router methods within the router.js file

app.use("/api/users/", usersRouter);


app.use(express.static("public"), function (req,res){
    res.sendStatus(200);
})
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL || TEST_DATABASE_URL, err => {
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
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
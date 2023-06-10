const express = require("express");
const Router = express.Router();
const authController = require("./../controllers/auth.controllers");

// login
Router.post("/login", authController.login);

// register
Router.post("/register", authController.register);

module.exports = Router;

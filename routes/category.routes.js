const express = require("express");
const Router = express.Router();

const connection = require("./../config/db.config");
const categoryControllers = require("./../controllers/category.controllers");

Router.get("/categories", categoryControllers.getCategories);

module.exports = Router;

const express = require("express");
const Router = express();

const userControllers = require("./../controllers/user.controllers");
const tokenMiddleware = require("./../middlewares/token.middleware");

Router.get(
  "/users/:userId/profile",
  tokenMiddleware.verifyToken,
  userControllers.getProfile
);

module.exports = Router;

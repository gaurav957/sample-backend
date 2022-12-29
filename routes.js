// var express = require("express");
import express from "express";
import * as authController from "./Controllers/AuthController";
var router = express.Router();
// var authController = require("./Controllers/AuthController");
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/validate", authController.validate_token);
router.post("/auth/verify", authController.verify);
router.post("/auth/setPassword", authController.setPassword);
// module.exports = router;

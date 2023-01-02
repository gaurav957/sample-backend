// var authService = require("../Services/AuthService");
import * as authService from "../Services/AuthService.js";
export const register = (req, res) => {
  let register = authService.Register(req.body, function (err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};

export const login = (req, res) => {
  let login = authService.Login(req.body, function (err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};

export const validate_token = (req, res) => {
  let validate = authService.Validate(req.body.token, function (err, result) {
    if (err) res.send(err.message);
    res.send(result);
  });
};

export const simple_hello = (req, res) => {
  res.send("Hello from our node server");
};

export const verify = (req, res) => {
  let login = authService.verify(req.body, function (err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};

export const setPassword = (req, res) => {
  let status = authService.setPassword(req.body, function (err, result) {
    if (err) res.send(err);
    res.send(status);
  });
};

export const enableMFA = (req, res) => {
  const status = authService.enableMFA(req.body, function (err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};

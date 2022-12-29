// var app = require("./app");
import app from "./app.js";
var server = app.listen(5000, function () {
  console.log("Server is running on port 5000");
});

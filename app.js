const express = require("express");
const app = express();
const { getTopics } = require("./controllers/controller.js");

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  const error = new Error("endpoint does not exist");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ msg: err.message });
});

module.exports = app;

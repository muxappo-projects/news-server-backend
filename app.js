const express = require("express");
const app = express();
const { getTopics } = require("./controllers/controller.js");

app.use(express.json());

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  const error = new Error("endpoint does not exist");

  error.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  res.status(404).send({ msg: "not found" });
});

module.exports = app;

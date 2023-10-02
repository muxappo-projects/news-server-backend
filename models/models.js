const db = require("../db/connection.js");
const fs = require("fs/promises");

exports.fetchEndpoints = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then((file) => {
    return JSON.parse(file);
  });
};

exports.fetchTopics = () => {
  const getQuery = `SELECT * FROM topics`;

  return db.query(getQuery).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleByID = (id) => {
  const getQuery = `
    SELECT * FROM articles
    WHERE article_id = $1
    `;
  return db.query(getQuery, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      const error = Error("ID does not exist");
      error.status = 404;
      throw error;
    }
    return rows;
  });
};

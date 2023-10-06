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
  SELECT
    articles.author, articles.article_id,
    articles.title, articles.topic,
    articles.created_at, articles.votes,
    articles.article_img_url, articles.body,
  COUNT (comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id;
    `;
  return db.query(getQuery, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        message: "ID does not exist",
      });
    }
    return rows;
  });
};

exports.fetchAllArticles = async (topic, sortby = "date", order = "desc") => {
  const validSortBys = {
    topic: "topic",
    author: "author",
    title: "title",
    votes: "votes",
    comment_count: "comment_count",
    date: "created_at",
    id: "article_id",
  };

  const validOrder = {
    desc: "DESC",
    asc: "ASC",
  };

  if (!(sortby in validSortBys) || !(order in validOrder)) {
    throw {
      status: 400,
      message: "Invalid parameter(s)",
    };
  }

  let whereClause = "";
  if (topic) {
    const { rows } = await db.query("SELECT * FROM topics WHERE slug = $1", [
      topic,
    ]);
    if (rows.length === 0) {
      throw {
        status: 404,
        message: "Not found",
      };
    }
    whereClause += "WHERE articles.topic = $1";
  }

  const getQuery = `
  SELECT
    articles.author, articles.title,
    articles.article_id, articles.topic,
    articles.created_at, articles.votes,
    articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  ${whereClause}
  GROUP BY articles.article_id
  ORDER BY ${validSortBys[sortby]} ${validOrder[order]} ; 
  `;

  const options = topic ? [topic] : [];

  const { rows } = await db.query(getQuery, options);
  return rows;
};

exports.fetchCommentsByArticle = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article not found",
        });
      }

      return db
        .query(
          `SELECT * FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC`,
          [id]
        )
        .then(({ rows }) => {
          return rows;
        });
    });
};

exports.createComment = ({ commentBody, username }, id) => {
  const postQuery = `INSERT INTO comments
      (body, author, article_id)
      VALUES
      ($1, $2, $3)
      RETURNING *;`;
  const values = [commentBody, username, id];

  return db.query(postQuery, values).then(({ rows }) => {
    return rows[0];
  });
};

exports.updateArticle = ({ inc_votes }, id) => {
  const updateQuery = `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
      `;
  const values = [inc_votes, id];

  return db.query(updateQuery, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        message: "Not found",
      });
    }
    return rows[0];
  });
};

exports.removeComment = (id) => {
  const delQuery = `
  DELETE FROM comments
  WHERE comment_id = $1
  `;

  return db.query(delQuery, [id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        message: "No rows deleted",
      });
    }
  });
};

exports.fetchAllUsers = () => {
  const getQuery = `
  SELECT * FROM users;
  `;

  return db.query(getQuery).then(({ rows }) => {
    return rows;
  });
};

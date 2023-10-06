const request = require("supertest");
const seed = require("../db/seeds/seed.js");

const app = require("../app.js");
const db = require("../db/connection.js");
const data = require("../db/data/test-data");

const endpointsJSON = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => db.end());

describe("GET requests", () => {
  it("returns a 404 if endpoint does not exist, inc. meaningful error message", () => {
    return request(app)
      .get("/api/notanendpoint")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Endpoint does not exist");
      });
  });

  it("returns a 400 when invaid ID is given", () => {
    return request(app)
      .get("/api/articles/articleOne")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid input format");
      });
  });

  describe("/api", () => {
    it('returns with 200 status code "OK"', () => {
      return request(app).get("/api").expect(200);
    });

    it("responds with an object containing all possible endpoints", () => {
      return request(app)
        .get("/api")
        .then(({ body: { endpoints } }) => {
          expect(endpoints).toEqual(endpointsJSON);
        });
    });
  });

  describe("/api/topics", () => {
    it('returns with 200 status code "OK"', () => {
      return request(app).get("/api/topics").expect(200);
    });

    it("responds with an array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .then(({ body: { topics } }) => {
          expect(Array.isArray(topics)).toBe(true);
          expect(topics.length).toBeGreaterThan(0);

          for (let i = 0; i < topics.length; i++) {
            const isObject = Object.keys(topics[i]).length > 0;
            const isNotArray = !Array.isArray(topics[i]);

            expect(isObject && isNotArray).toBe(true);
          }
        });
    });

    it("returned objects should have slug and description properties", () => {
      return request(app)
        .get("/api/topics")
        .then(({ body: { topics } }) => {
          expect(topics.length).toBeGreaterThan(0);

          for (let i = 0; i < topics.length; i++) {
            expect(
              topics[i].hasOwnProperty("slug") &&
                topics[i].hasOwnProperty("description")
            ).toBe(true);
          }
        });
    });
  });

  describe("/api/articles/:article_id", () => {
    it('returns with 200 status code "OK"', () => {
      return request(app).get("/api/articles/3").expect(200);
    });

    it("responds with the correct article object containing the required properties", () => {
      return request(app)
        .get("/api/articles/1")
        .then(({ body: { article } }) => {
          const isObject = Object.keys(article[0]).length > 0;
          const isNotArray = !Array.isArray(article[0]);

          const properties = [
            "title",
            "author",
            "topic",
            "article_id",
            "body",
            "created_at",
            "votes",
            "article_img_url",
            "comment_count",
          ];

          expect(isObject && isNotArray).toBe(true);

          for (let i = 0; i < properties.length; i++) {
            expect(article[0].hasOwnProperty(properties[i])).toBe(true);
          }
        });
    });

    it("returns a 404 if no id is found, inc. a meaningful error", () => {
      return request(app)
        .get("/api/articles/600")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("ID does not exist");
        });
    });
  });

  describe("/api/articles", () => {
    it('returns with 200 status code "OK"', () => {
      return request(app).get("/api/articles").expect(200);
    });

    it("responds with an array of article objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles.length).toBeGreaterThan(0);

          for (let i = 0; i < articles.length; i++) {
            const isObject = Object.keys(articles[i]).length > 0;
            const isNotArray = !Array.isArray(articles[i]);

            expect(isObject && isNotArray).toBe(true);
          }
        });
    });

    it("returned objects have the required properties", () => {
      return request(app)
        .get("/api/articles")
        .then(({ body: { articles } }) => {
          return articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(String),
              })
            );
          });
        });
    });

    it("returns articles in descending order by date", () => {
      return request(app)
        .get("/api/articles")
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });

    describe("FEATURE: /api/articles?topic=<topic_name>", () => {
      it("responds with a filtered list of articles when passed a valid topic", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(1);
            expect(articles[0].topic).toBe("cats");
          });
      });

      it("returns a 404 when given a topic that doesn't exist", () => {
        return request(app)
          .get("/api/articles?topic=dogs")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Not found");
          });
      });

      it("returns 'No articles under that topic' when passed a topic with no associated articles", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .then(({ body: { articles } }) => {
            expect(articles).toBe("No articles under that topic");
          });
      });
    });
  });

  describe("/api/articles/:article_id/comments", () => {
    it('returns with status code 200 "OK"', () => {
      return request(app).get("/api/articles/1/comments").expect(200);
    });

    it("returned objects contain the required properties", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);

          return comments.forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: expect.any(Number),
              })
            );
          });
        });
    });

    it("returned array should be sorted by most recent comments", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });

    it("returns a 404 if the ID does not exist", () => {
      return request(app)
        .get("/api/articles/45/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });
  });

  describe("/api/users", () => {
    it('should return with status code 200 "OK"', () => {
      return request(app).get("/api/users").expect(200);
    });

    it("responds with an array of user objects containing the required properties", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);

          return users.forEach((user) => {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
              })
            );
          });
        });
    });
  });
});

describe("POST/PATCH requests", () => {
  describe("/api/articles/:article_id/comments", () => {
    it('returns a 201 status code "CREATED"', () => {
      const newComment = {
        username: "rogersop",
        commentBody: "I LOVE MITCH",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(201);
    });

    it("responds with the created comment", () => {
      const newComment = {
        username: "rogersop",
        commentBody: "I LOVE MITCH",
      };

      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .then(({ body: { created_comment } }) => {
          expect(created_comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: expect.any(Number),
              author: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(String),
            })
          );
        });
    });

    it("ignores any unnecessary data when inserting the comment", () => {
      const newComment = {
        username: "rogersop",
        yes: "true",
        commentBody: "I LOVE MITCH",
        coding: "absolutely",
        hotel: "trivago",
      };

      return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(201)
        .then(({ body: { created_comment } }) => {
          expect(created_comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: expect.any(Number),
              author: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(String),
            })
          );
        });
    });

    it("returns a 404 if the article ID doesn't exist", () => {
      const newComment = {
        username: "rogersop",
        commentBody: "I LOVE MITCH",
      };

      return request(app)
        .post("/api/articles/50/comments")
        .send(newComment)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found");
        });
    });

    it("returns a 404 if the username doesn't exist", () => {
      const newComment = {
        username: "imNotReal",
        commentBody: "I LOVE MITCH",
      };

      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found");
        });
    });

    it("returns a 400 when sent an empty object", () => {
      const newComment = {};

      return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Required field(s) missing");
        });
    });

    it("returns a 400 when article ID is of an invalid data type", () => {
      const newComment = {
        username: "rogersop",
        commentBody: "I LOVE MITCH",
      };

      return request(app)
        .post("/api/articles/articleOne/comments")
        .send(newComment)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input format");
        });
    });
  });

  describe("PATCH /api/articles/:article_id", () => {
    it('returns a 200 status code "OK"', () => {
      const articlePatch = {
        inc_votes: 1,
      };

      return request(app)
        .patch("/api/articles/1")
        .send(articlePatch)
        .expect(200);
    });

    it("responds with the updated article containing all properties", () => {
      const articlePatch = {
        inc_votes: 1,
      };

      return request(app)
        .patch("/api/articles/1")
        .send(articlePatch)
        .then(({ body: { article } }) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              body: "I find this existence challenging",
              created_at: expect.any(String),
              votes: 101,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            })
          );
        });
    });

    it("correctly changes the votes property by the provided value", () => {
      const increment = {
        inc_votes: 1,
      };
      const decrement = {
        inc_votes: -10,
      };

      const incrementPatch = request(app)
        .patch("/api/articles/1")
        .send(increment)
        .then(
          ({
            body: {
              article: { votes },
            },
          }) => {
            expect(votes).toBe(101);
          }
        );
      const decrementPatch = request(app)
        .patch("/api/articles/1")
        .send(decrement)
        .then(
          ({
            body: {
              article: { votes },
            },
          }) => {
            expect(votes).toBe(91);
          }
        );

      return Promise.all([incrementPatch, decrementPatch]);
    });

    it("ignores unnecessary data when updating article", () => {
      const patch = {
        author: "John",
        john: "yes",
        inc_votes: 1,
        yes: "I already said that",
      };

      return request(app)
        .patch("/api/articles/1")
        .send(patch)
        .then(({ body: { article } }) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              body: "I find this existence challenging",
              created_at: expect.any(String),
              votes: 101,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            })
          );
        });
    });

    it("returns a 404 when article ID is not found ", () => {
      const patch = {
        inc_votes: 1,
      };

      return request(app)
        .patch("/api/articles/34")
        .send(patch)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found");
        });
    });

    it("returns a 400 when given invalid input formats", () => {
      const patch1 = {
        inc_votes: 1,
      };

      const patch2 = {
        inc_votes: "one",
      };

      const invalidArticle = request(app)
        .patch("/api/articles/patchThis")
        .send(patch1)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input format");
        });

      const invalidIncType = request(app)
        .patch("/api/articles/1")
        .send(patch2)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input format");
        });

      return Promise.all([invalidArticle, invalidIncType]);
    });

    it("returns a 400 when sent an incomplete request object", () => {
      const patch = {};

      return request(app)
        .patch("/api/articles/1")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Required field(s) missing");
        });
    });
  });
});

describe("DELETE requests", () => {
  describe("/api/comments/:comment_id", () => {
    it('returns with status code 204 "No Content"', () => {
      return request(app).delete("/api/comments/1").expect(204);
    });

    it("returns a 404 if no content is deleted (ID doesn't existed)", () => {
      return request(app)
        .delete("/api/comments/34")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No rows deleted");
        });
    });

    it("returns a 400 if given invalid comment ID", () => {
      return request(app)
        .delete("/api/comments/commentOne")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input format");
        });
    });
  });
});

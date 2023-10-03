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
        expect(msg).toBe("endpoint does not exist");
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
});

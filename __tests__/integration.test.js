const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");

beforeEach(() => {
  return seed(data);
});

afterAll(() => db.end());

describe("GET requests", () => {
  it("returns a 404 if endpoint does not exist", () => {
    return request(app).get("/api/notanendpoint").expect(404);
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
        });
    });

    it("returned objects should have slug and description properties", () => {
      return request(app)
        .get("/api/topics")
        .then(({ body: { topics } }) => {
          console.log(topics);
          for (let i = 0; i < topics.length; i++) {
            expect(
              topics[i].hasOwnProperty("slug") &&
                topics[i].hasOwnProperty("description")
            ).toBe(true);
          }
        });
    });
  });
});

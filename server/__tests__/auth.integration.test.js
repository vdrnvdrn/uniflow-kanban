/**
 * @jest-environment node
 */
process.env.NODE_ENV = "test";

const request = require("supertest");
const sequelize = require("../database");
const User = require("../modules/user/model");

// Import app after setting NODE_ENV
const app = require("../index");

describe("Auth API Integration Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/auth/signup", () => {
    it("should register a new user with valid data", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Test User",
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(res.body.message).toBe("User registered successfully!");
    });

    it("should reject signup with short password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Test User 2",
          username: "testuser2",
          email: "test2@example.com",
          password: "123",
        })
        .expect(400);

      expect(res.body.message).toMatch(/Password must be at least 6 characters/);
    });

    it("should reject duplicate username", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Test User Duplicate",
          username: "testuser",
          email: "unique@example.com",
          password: "password123",
        })
        .expect(409);

      expect(res.body.message).toMatch(/Username or email already exists/);
    });
  });

  describe("POST /api/auth/signin", () => {
    it("should login with valid credentials and return JWT", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({
          username: "testuser",
          password: "password123",
        })
        .expect(200);

      expect(res.body.token).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.role).toBeDefined();
      expect(res.body.fullName).toBe("Test User");
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({
          username: "testuser",
          password: "wrongpassword",
        })
        .expect(401);

      expect(res.body.message).toMatch(/Invalid password/);
    });

    it("should reject login for non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({
          username: "nonexistent",
          password: "password123",
        })
        .expect(404);

      expect(res.body.message).toMatch(/User not found/);
    });
  });
});

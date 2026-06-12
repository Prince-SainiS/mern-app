const request = require("supertest");
const app = require("../app");

describe("Auth Endpoints", () => {
  describe("POST /api/v1/user/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/api/v1/user/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password123",  // 👈 fixed
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.data.newUser.email).toBe("testuser@example.com");
      expect(response.body.data.newUser.password).toBeUndefined();
    });

    it("should fail if password donot match", async () => {
      const response = await request(app).post("/api/v1/user/register").send({
        username: "testuser2",
        email: "testuser2@example.com",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password456", // 👈 fixed (still mismatched, but valid format)
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("should fail with invalid email", async () => {
      const response = await request(app).post("/api/v1/user/register").send({
        username: "testuser3",
        email: "invalidemail",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password123", // 👈 fixed
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should fail if email already exists", async () => {
      await request(app).post("/api/v1/user/register").send({
        username: "testuser4",
        email: "testuser4@example.com",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password123", // 👈 fixed
      });

      const response = await request(app).post("/api/v1/user/register").send({
        username: "testuser4",
        email: "testuser4@example.com",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password123", // 👈 fixed
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/v1/user/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/user/register").send({
        username: "loginuser",
        email: "loginuser@example.com",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password123", // 👈 fixed
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/v1/user/login").send({
        email: "loginuser@example.com",
        password: "Password123",        // 👈 fixed
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.accessToken).toBeDefined();

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const refreshTokenCookie = cookies.find((cookie) =>
        cookie.startsWith("refreshToken="),
      );
      expect(refreshTokenCookie).toBeDefined();
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app).post("/api/v1/user/login").send({
        email: "loginuser@example.com",
        password: "WrongPassword123",   // 👈 valid format but wrong
      });
      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("Wrong Password"); // 👈 fixed case
    });

    it("should fail with non existing email", async () => {
      const response = await request(app).post("/api/v1/user/login").send({
        email: "nonexistent@example.com",
        password: "Password123",        // 👈 fixed
      });
      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("User does not exist"); // 👈 fixed message
    });
  });

  describe("GET /api/v1/user/me", () => {
    let accessToken;
    beforeEach(async () => {
      await request(app).post("/api/v1/user/register").send({
        username: "protecteduser",
        email: "protecteduser@example.com",
        password: "Password123",        // 👈 fixed
        confirmPassword: "Password123", // 👈 fixed
      });
      const loginResponse = await request(app).post("/api/v1/user/login").send({
        email: "protecteduser@example.com",
        password: "Password123",        // 👈 fixed
      });
      accessToken = loginResponse.body.accessToken;
    });

    it("should return user data with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/user/me")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toBeDefined(); // 👈 also fixed structure
    });

    it("should fail without token", async () => {
      const response = await request(app).get("/api/v1/user/me");
      expect(response.statusCode).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/user/me")
        .set("Authorization", "Bearer invalidtoken123");
      expect(response.statusCode).toBe(401);
    });
  });
});
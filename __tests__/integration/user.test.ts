import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../server/app";
import User from "../../server/api/user/user.model";
import * as userController from "../../server/api/user/user.controller";

let validToken: string;
let userId: string;

beforeEach(async () => {
  const name = "John";
  const email = "john@example.com";
  const password = "password";
  const user = await userController.createUser(name, email, password);
  const token = jwt.sign({ user }, process.env.JWT_SECRET!);
  validToken = token;
  userId = user._id.toString();
});

afterEach(async () => {
  await User.deleteMany();
  jest.clearAllMocks();
});

describe("User API", () => {
  describe("POST /signup", () => {
    it("should create a new user", async () => {
      const response = await request(app).post("/signup").send({
        name: "Jane",
        email: "jane@example.com",
        password: "password",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 if validation fails", async () => {
      const response = await request(app)
        .post("/signup")
        .send({ name: "", email: "invalidemail", password: "password" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it.skip("should handle errors and return a 500 status code", async () => {
      jest
        .spyOn(userController, "createUser")
        .mockRejectedValueOnce(new Error("Some error"));

      const response = await request(app).post("/signup").send({
        name: "Jane",
        email: "jane@example.com",
        password: "password",
      });

      expect(response.statusCode).toBe(500);
      expect(response.text).toEqual("Internal Server Error");
    });
  });

  describe("POST /login", () => {
    it("should log in a user", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "john@example.com", password: "password" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
    });

    it("should return 401 if password is incorrect", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "john@example.com", password: "wrongpassword" });

      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("Password is incorrect");
    });

    it("should return 400 if validation fails", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "invalidemail", password: "" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("Authenticated routes", () => {
    describe("GET /users", () => {
      it("should get all users", async () => {
        const response = await request(app)
          .get("/users")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });
    });

    describe("GET /user/:id", () => {
      it("should get a user by ID", async () => {
        const response = await request(app)
          .get(`/user/${userId}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
      });
    });

    describe("PUT /user/:id", () => {
      it("should update a user", async () => {
        const response = await request(app)
          .put(`/user/${userId}`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ name: "Updated User" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name", "Updated User");
      });

      it("should return 400 if validation fails", async () => {
        const response = await request(app)
          .put(`/user/${userId}`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ name: "", email: "", password: "pass" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("errors");
      });
    });

    describe("DELETE /user/:id", () => {
      it("should delete a user", async () => {
        const response = await request(app)
          .delete(`/user/${userId}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
      });
    });
  });
});

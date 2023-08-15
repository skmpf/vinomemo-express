import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../server/app";
import User, { IUser } from "../../server/api/users/user.model";
import * as userController from "../../server/api/users/user.controller";
import mongoose from "mongoose";

let userToken: string;
let userId: string;

const mockUser = {
  name: "Test User",
  email: "test.user@email.com",
  password: "password",
};

beforeEach(async () => {
  const user = await userController.createUser(
    mockUser.name,
    mockUser.email,
    mockUser.password
  );

  userToken = jwt.sign({ user }, process.env.JWT_SECRET!);
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
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 if validation fails", async () => {
      const response = await request(app)
        .post("/signup")
        .send({ name: "", email: "invalidemail", password: "password" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should handle errors and return a 500 status code", async () => {
      jest
        .spyOn(userController, "createUser")
        .mockRejectedValueOnce(new Error("Some error"));

      const response = await request(app).post("/signup").send({
        name: "Jane",
        email: "jane@example.com",
        password: "password",
      });

      expect(response.statusCode).toBe(500);
      expect(response.text).toEqual(
        JSON.stringify({
          success: false,
          status: 500,
          message: "Some error",
          stack: {},
        })
      );
    });
  });

  describe("POST /login", () => {
    it("should log in a user", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: mockUser.email, password: mockUser.password });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should return 401 if email is incorrect", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "wrongemail@email.com", password: mockUser.password });

      expect(response.statusCode).toBe(401);
      expect(response.text).toBe(
        JSON.stringify({
          success: false,
          status: 401,
          message: "Unauthorized - Invalid credentials",
          stack: {},
        })
      );
    });

    it("should return 401 if password is incorrect", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: mockUser.email, password: "wrongpassword" });

      expect(response.statusCode).toBe(401);
      expect(response.text).toBe(
        JSON.stringify({
          success: false,
          status: 401,
          message: "Unauthorized - Invalid credentials",
          stack: {},
        })
      );
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
      it("should get all users if requester is an admin", async () => {
        jest.spyOn(userController, "getUserById").mockReturnValueOnce({
          ...mockUser,
          isAdmin: true,
        } as any);

        const response = await request(app)
          .get("/users")
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });

      it("should return 401 if requester is not an admin", async () => {
        const response = await request(app)
          .get("/users")
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.statusCode).toBe(401);
        expect(response.text).toBe(
          JSON.stringify({
            success: false,
            status: 401,
            message: "Unauthorized",
            stack: {},
          })
        );
      });
    });

    describe("GET /users/me", () => {
      it("should get the current user", async () => {
        const response = await request(app)
          .get("/users/me")
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
      });

      it("should return 401 if no token is provided", async () => {
        const response = await request(app).get("/users/me");

        expect(response.statusCode).toBe(401);
        expect(response.text).toBe(
          JSON.stringify({
            success: false,
            status: 401,
            message: "Unauthorized - No JWT",
            stack: {},
          })
        );
      });

      it("should return 401 if token is invalid", async () => {
        const response = await request(app)
          .get("/users/me")
          .set("Authorization", `Bearer ${userToken}invalid`);

        expect(response.statusCode).toBe(401);
        expect(response.text).toBe(
          JSON.stringify({
            success: false,
            status: 401,
            message: "invalid signature",
            stack: {},
          })
        );
      });

      it("should return null if user is not found", async () => {
        jest.spyOn(userController, "getUserById").mockResolvedValueOnce(null);

        const response = await request(app)
          .get("/users/me")
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).not.toHaveProperty("name");
        expect(response.body).not.toHaveProperty("email");
      });
    });

    describe("GET /users/:id", () => {
      it("should get a user by ID", async () => {
        const response = await request(app)
          .get(`/users/${userId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
      });
    });

    describe("PUT /users/:id", () => {
      it("should update a user", async () => {
        const updatedUser: IUser & mongoose.Document<any> = {
          ...mockUser,
          name: "Updated User",
          _id: new mongoose.Types.ObjectId(),
          __v: 0,
          id: new mongoose.Types.ObjectId().toHexString(),
          save: jest.fn().mockResolvedValue({}),
        } as any;

        const response = await request(app)
          .put(`/users/${userId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ name: "Updated User" });

        jest
          .spyOn(userController, "updateUser")
          .mockResolvedValueOnce(updatedUser);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name", "Updated User");
      });

      it("should return 400 if validation fails", async () => {
        const response = await request(app)
          .put(`/users/${userId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ name: "", email: "", password: "pass" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("errors");
      });
    });

    describe("DELETE /users/:id", () => {
      it("should delete a user", async () => {
        const response = await request(app)
          .delete(`/users/${userId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
      });
    });
  });
});

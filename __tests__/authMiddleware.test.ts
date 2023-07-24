import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../server/types/express";
import { getUserById } from "../server/api/users/user.controller";
import { getNoteById } from "../server/api/notes/note.controller";
import {
  adminOnly,
  authenticate,
  checkPermissionsNote,
  checkPermissionsUser,
} from "../server/middleware/authMiddleware";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
jest.mock("../server/api/users/user.controller");
jest.mock("../server/api/notes/note.controller");

let req: CustomRequest;
let res: Response;
let next: NextFunction;

beforeEach(() => {
  req = {
    header: jest.fn(),
    params: {},
  } as unknown as CustomRequest;
  res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Auth middlewares", () => {
  describe("authenticate", () => {
    it("should throw an error if no token is provided", async () => {
      req.header = jest.fn().mockReturnValue(null);

      await authenticate(req, res, next);

      expect(req.header).toHaveBeenCalledWith("authorization");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(
        "Unauthorized - Unauthorized - no jwt"
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should authenticate and call next if a valid token is provided", async () => {
      const decodedToken = {
        user: { _id: new mongoose.Types.ObjectId("user12345678").toString() },
      };
      req.header = jest.fn().mockReturnValueOnce("Bearer valid_token");
      (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);
      (getUserById as jest.Mock).mockResolvedValueOnce(decodedToken.user);

      await authenticate(req, res, next);

      expect(req.header).toHaveBeenCalledWith("authorization");
      expect(jwt.verify).toHaveBeenCalled();
      expect(getUserById).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId("user12345678").toString()
      );
      expect(req.user).toEqual({
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe("adminOnly", () => {
    it("should throw an error if the user is not an admin", () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: false,
      };

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next if the user is an admin", async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: true,
      };

      adminOnly(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("checkPermissionsUser", () => {
    it("should throw an error if the user is not an admin and the id in the token does not match the id in the request params", () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: false,
      };
      req.params.id = new mongoose.Types.ObjectId("user87654321").toString();

      checkPermissionsUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next if the user is an admin", () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: true,
      };
      req.params.id = new mongoose.Types.ObjectId("user87654321").toString();

      checkPermissionsUser(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("should call next if the user has permission", () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: false,
      };
      req.params.id = new mongoose.Types.ObjectId("user12345678").toString();

      checkPermissionsUser(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("checkPermissionsNote", () => {
    it("should throw an error if the user is not an admin and the id in the token does not match the id in the request params", async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: false,
      };
      req.params.id = "note123";
      (getNoteById as jest.Mock).mockResolvedValueOnce({
        creator: new mongoose.Types.ObjectId("user87654321"),
      });

      await checkPermissionsNote(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next if the user is an admin", async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: true,
      };
      req.params.id = "note123";

      await checkPermissionsNote(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("should call next if the user has permission", async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId("user12345678").toString(),
        name: "test user",
        email: "test@email.com",
        passwordHash: "password_hash",
        isAdmin: false,
      };
      req.params.id = "note123";
      (getNoteById as jest.Mock).mockResolvedValueOnce({
        creator: new mongoose.Types.ObjectId("user12345678"),
      });

      await checkPermissionsNote(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});

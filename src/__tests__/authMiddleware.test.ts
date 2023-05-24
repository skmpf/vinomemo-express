import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as userController from "../controllers/user";
import { authenticate } from "../middlewares/authMiddleware";
import { CustomRequest } from "../types/express";

// Mock the dependencies and functions used in the authenticate function
jest.mock("jsonwebtoken");
jest.mock("../controllers/user");

describe("authenticate", () => {
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
    process.env.JWT_SECRET = "secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should call next if authentication is successful", async () => {
    const token = "valid-token";
    const decodedToken = {
      user: { _id: "user123" },
    };

    req.header = jest.fn().mockReturnValueOnce(`Bearer ${token}`);
    (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);
    (userController.getUserById as jest.Mock).mockResolvedValueOnce(
      decodedToken.user
    );

    await authenticate(req, res, next);

    console.log(
      "🚀 ~ file: authMiddleware.test.ts:50 ~ test ~ req.user:",
      req.user
    );
    expect(req.user).toEqual(decodedToken.user);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test("should return No token provided if no token is provided", async () => {
    req.header = jest.fn().mockReturnValueOnce(undefined);

    await authenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unauthorized - No token provided");
    expect(next).not.toHaveBeenCalled();
  });

  test("should return Invalid token if token verification fails", async () => {
    const token = "invalid-token";

    req.header = jest.fn().mockReturnValueOnce(`Bearer ${token}`);
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await authenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unauthorized - Invalid token");
    expect(next).not.toHaveBeenCalled();
  });

  test("should return User not allowed if user ID is unauthorized", async () => {
    const token = "valid-token";
    const decodedToken = {
      user: { _id: "user456" },
    };

    req.header = jest.fn().mockReturnValueOnce(`Bearer ${token}`);
    (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);
    req.params.id = "user123";

    await authenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unauthorized - User not allowed");
    expect(next).not.toHaveBeenCalled();
  });
});

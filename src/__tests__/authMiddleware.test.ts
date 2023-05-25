import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../controllers/user";
import { authenticate } from "../middlewares/authMiddleware";
import { CustomRequest } from "../types/express";

// Mock the dependencies and functions used in the authenticate function
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw an error if no token is provided", async () => {
    await authenticate(req, res, next);

    expect(req.header).toHaveBeenCalledWith("Authorization");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unauthorized - No token provided");
    expect(next).not.toHaveBeenCalled();
  });

  test("should throw an error if the id in the token does not match the id in the request params", async () => {
    const decodedToken = {
      user: { _id: "user123" },
    };
    req.header = jest.fn().mockReturnValueOnce("Bearer valid_token");
    req.params.id = "user456";
    (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);

    await authenticate(req, res, next);

    expect(req.header).toHaveBeenCalledWith("Authorization");
    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unauthorized - User not allowed");
    expect(next).not.toHaveBeenCalled();
  });

  test("should authenticate and call next if a valid token is provided with matching user ID", async () => {
    const decodedToken = {
      user: { _id: "user123" },
    };
    req.params.id = "user123";
    req.header = jest.fn().mockReturnValueOnce("Bearer valid_token");
    (jwt.verify as jest.Mock).mockReturnValueOnce(decodedToken);
    (getUserById as jest.Mock).mockResolvedValueOnce(decodedToken.user);

    await authenticate(req, res, next);

    expect(req.header).toHaveBeenCalledWith("Authorization");
    expect(jwt.verify).toHaveBeenCalled();
    expect(getUserById).toHaveBeenCalledWith("user123");
    expect(req.user).toEqual({ _id: "user123" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});

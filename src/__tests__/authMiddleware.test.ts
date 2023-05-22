import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticate } from "../middlewares/authMiddleware";
import { CustomRequest } from "../types/express";
import { mockUser } from "./mocks/user";

const mockDecodedToken = {
  user: {
    _id: mockUser._id,
  },
};

describe("authenticate middleware", () => {
  let mockRequest: CustomRequest;
  let mockResponse: Response;
  let mockNextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
      params: {},
    } as unknown as CustomRequest;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    mockNextFunction = jest.fn();
  });

  it("should set the user in the request object when a valid token is provided", async () => {
    mockRequest.header = jest.fn().mockReturnValue("Bearer valid_token");
    jest.spyOn(jwt, "verify").mockReturnValue(mockDecodedToken);
    jest.spyOn(User, "findById").mockResolvedValue(mockUser);

    await authenticate(mockRequest, mockResponse, mockNextFunction);

    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNextFunction).toHaveBeenCalled();
    expect(mockRequest.params.id).toBeUndefined(); // Ensure id parameter is undefined
  });

  it("should return 401 Unauthorized if no token is provided", async () => {
    mockRequest.header = jest.fn().mockReturnValue(null);

    await authenticate(mockRequest, mockResponse, mockNextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith("Unauthorized");
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 Unauthorized if the token is invalid", async () => {
    mockRequest.header = jest.fn().mockReturnValue("Bearer invalid_token");
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("JsonWebTokenError: invalid signature");
    });

    await authenticate(mockRequest, mockResponse, mockNextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith("Unauthorized");
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 Unauthorized if the user does not exist", async () => {
    mockRequest.header = jest.fn().mockReturnValue("Bearer valid_token");
    jest.spyOn(jwt, "verify").mockReturnValue(mockDecodedToken);
    jest.spyOn(User, "findById").mockResolvedValue(null);

    await authenticate(mockRequest, mockResponse, mockNextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith("Unauthorized");
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 Unauthorized if the provided id does not match the decoded user id", async () => {
    mockRequest.header = jest.fn().mockReturnValue("Bearer valid_token");
    jest.spyOn(jwt, "verify").mockReturnValue(mockDecodedToken);
    jest.spyOn(User, "findById").mockResolvedValue(mockUser);
    mockRequest.params.id = "other_id"; // Set a different id

    await authenticate(mockRequest, mockResponse, mockNextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith("Unauthorized");
    expect(mockNextFunction).not.toHaveBeenCalled();
  });
});

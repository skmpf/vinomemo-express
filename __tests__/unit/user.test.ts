import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import User from "../../server/api/user/user.model";
import {
  createUser,
  getUserById,
  getUserByEmail,
  getUsers,
  updateUser,
  deleteUser,
} from "../../server/api/user/user.controller";
import { mockUser } from "./mocks/user";

jest.mock("bcrypt");
jest.mock("../../server/api/user/user.model");

afterEach(async () => {
  await User.deleteMany();
  jest.clearAllMocks();
});

describe("User Controller", () => {
  describe("createUser", () => {
    it("should create a new user", async () => {
      const { name, email, password } = mockUser;
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(mockUser.passwordHash);
      (User.create as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(createUser(name, email, password)).resolves.toEqual(
        mockUser
      );

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(User.create).toHaveBeenCalledWith({
        name,
        email,
        passwordHash: mockUser.passwordHash,
      });
    });

    it("should not create a new user with an existing email", async () => {
      const { name, email, password } = mockUser;
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(createUser(name, email, password)).rejects.toThrow(
        "User with this email already exists"
      );

      expect(User.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe("getUserById", () => {
    it("should get a user by ID", async () => {
      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(getUserById(mockUser._id.toString())).resolves.toEqual(
        mockUser
      );

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
    });

    it("should throw an error when getting a user by non-existent ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(getUserById(nonExistentId.toString())).rejects.toThrow(
        "User was not found"
      );

      expect(User.findById).toHaveBeenCalledWith(nonExistentId.toString());
    });
  });

  describe("getUserByEmail", () => {
    it("should get a user by email", async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(getUserByEmail(mockUser.email)).resolves.toEqual(mockUser);

      expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it("should throw an error when getting a user by non-existent email", async () => {
      const nonExistentEmail = "nonexistent@example.com";

      await expect(getUserByEmail(nonExistentEmail)).rejects.toThrow(
        "User was not found"
      );

      expect(User.findOne).toHaveBeenCalledWith({ email: nonExistentEmail });
    });
  });

  describe("getUsers", () => {
    it("should get all users", async () => {
      const users = [
        mockUser,
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          passwordHash: "hashedpassword",
        },
      ];
      (User.find as jest.Mock).mockResolvedValueOnce(users);

      await expect(getUsers()).resolves.toEqual(users);

      expect(User.find).toHaveBeenCalled();
    });

    it("should throw an error when no users found", async () => {
      (User.find as jest.Mock).mockResolvedValueOnce([]);

      await expect(getUsers()).rejects.toThrow("Users were not found");

      expect(User.find).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const name = "John Doe";
      const email = "john.doe@example.com";
      const password = "password123";

      (User.findById as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        save: jest.fn(),
      });
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce("newhashedpassword");

      const updatedUser = await updateUser(
        mockUser._id.toString(),
        name,
        email,
        password
      );

      expect(updatedUser).toEqual({
        ...mockUser,
        password,
        passwordHash: "newhashedpassword",
        updatedAt: expect.any(Date),
        save: expect.any(Function),
      });
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(updatedUser.save).toHaveBeenCalled();
    });

    it("should not update a user with an existing email", async () => {
      const id = new mongoose.Types.ObjectId();
      const name = "John Doe";
      const email = "john.doe@example.com";
      const password = "password123";

      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
      (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: id });

      await expect(
        updateUser(mockUser._id.toString(), name, email, password)
      ).rejects.toThrow("User with this email already exists");

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should not update a user when no changes are provided", async () => {
      const name = "";
      const email = "";
      const password = "";

      (User.findById as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        save: jest.fn(),
      });

      const updatedUser = await updateUser(
        mockUser._id.toString(),
        name,
        email,
        password
      );

      expect(updatedUser).toEqual({
        ...mockUser,
        updatedAt: expect.any(Date),
        save: expect.any(Function),
      });
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(updatedUser.save).not.toHaveBeenCalled();
    });

    it("should throw an error when updating a non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const name = "John Doe";
      const email = "john.doe@example.com";
      const password = "password123";
      (User.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        updateUser(nonExistentId.toString(), name, email, password)
      ).rejects.toThrow("User was not found");

      expect(User.findById).toHaveBeenCalledWith(nonExistentId.toString());
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(deleteUser(mockUser._id.toString())).resolves.toEqual(
        mockUser
      );

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
    });

    it("should throw an error when deleting a non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      (User.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(null);

      await expect(deleteUser(nonExistentId.toString())).rejects.toThrow(
        "User was not found"
      );

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(
        nonExistentId.toString()
      );
    });
  });
});

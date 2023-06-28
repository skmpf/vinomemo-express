import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import User from "../../server/api/users/user.model";
import {
  createUser,
  getUserById,
  getUserByEmail,
  getUsers,
  updateUser,
  deleteUser,
} from "../../server/api/users/user.controller";

const mockUser = {
  _id: new mongoose.Types.ObjectId("5f8d0f7b4f4d4b1f3c0b0f7b"),
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  passwordHash: "hashedpassword",
};

jest.mock("bcrypt");
jest.mock("../../server/api/users/user.model");

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
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
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
        "Email is already in use"
      );

      expect(User.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe("getUserById", () => {
    it("should get a user by ID", async () => {
      (User.findById as jest.Mock).mockImplementation(() => {
        return {
          ...mockUser,
          select: jest.fn().mockReturnThis(),
        };
      });

      await expect(getUserById(mockUser._id.toString())).resolves.toEqual({
        ...mockUser,
        select: expect.any(Function),
      });

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
    });
  });

  describe("getUserByEmail", () => {
    it("should get a user by email", async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(getUserByEmail(mockUser.email)).resolves.toEqual(mockUser);

      expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
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

      (User.find as jest.Mock).mockImplementation(() => {
        return {
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValueOnce(users),
        };
      });

      await expect(getUsers()).resolves.toEqual(users);

      expect(User.find).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const name = "New Name";
      const email = "new.name@example.com";
      const password = "newpassword";

      const saveSpy = jest.fn().mockResolvedValue(true);
      (User.findById as jest.Mock).mockImplementation(() => {
        return {
          ...mockUser,
          save: saveSpy,
          select: jest.fn().mockReturnThis(),
        };
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
        save: expect.any(Function),
        select: expect.any(Function),
      });
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(saveSpy).toHaveBeenCalled();
    });

    it("should throw an error when updating a user with a non existent ID", async () => {
      const name = "New Name";
      const email = "new.name@example.com";
      const password = "password123";

      (User.findById as jest.Mock).mockResolvedValueOnce(null);
      const saveSpy = jest.fn().mockResolvedValue(false);

      await expect(
        updateUser("wrongid", name, email, password)
      ).rejects.toThrow("Invalid request");

      expect(User.findById).toHaveBeenCalledWith("wrongid");
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it("should throw an error when updating a user with an existing email", async () => {
      const id = new mongoose.Types.ObjectId();
      const name = "New Name";
      const email = "new.name@example.com";
      const password = "password123";

      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
      (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: id });
      const saveSpy = jest.fn().mockResolvedValue(false);

      await expect(
        updateUser(mockUser._id.toString(), name, email, password)
      ).rejects.toThrow("Email is already in use");

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it("should not update a user when no changes are provided", async () => {
      const name = "";
      const email = "";
      const password = "";

      (User.findById as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        save: jest.fn(),
      });
      const saveSpy = jest.fn().mockResolvedValue(false);

      const updatedUser = await updateUser(
        mockUser._id.toString(),
        name,
        email,
        password
      );

      expect(updatedUser).toEqual(null);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      (User.findByIdAndDelete as jest.Mock).mockImplementation(() => {
        return {
          ...mockUser,
          select: jest.fn().mockReturnThis(),
        };
      });

      await expect(deleteUser(mockUser._id.toString())).resolves.toEqual({
        ...mockUser,
        select: expect.any(Function),
      });

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
    });
  });
});

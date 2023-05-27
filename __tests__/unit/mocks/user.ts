import mongoose from "mongoose";

export const mockUser = {
  _id: new mongoose.Types.ObjectId("5f8d0f7b4f4d4b1f3c0b0f7b"),
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  passwordHash: "hashedpassword",
};

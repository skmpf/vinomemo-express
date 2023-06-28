import * as bcrypt from "bcrypt";
import User from "./user.model";

const SALT_ROUNDS = 12;

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email is already in use");

  return await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
  });
};

export const getUserById = async (userId: string) =>
  await User.findById(userId).select("-passwordHash");

export const getUserByEmail = async (email: string) =>
  await User.findOne({ email });

export const getUsers = async () =>
  await User.find().select("-passwordHash").exec();

export const updateUser = async (
  userId: string,
  name?: string,
  email?: string,
  password?: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Invalid request");

  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error("Email is already in use");
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (password) user.passwordHash = await hashPassword(password);
  if (name || email || password) {
    await user.save();
    return await User.findById(userId).select("-passwordHash");
  }
  return null;
};

export const deleteUser = async (userId: string) =>
  await User.findByIdAndDelete(userId).select("-passwordHash");

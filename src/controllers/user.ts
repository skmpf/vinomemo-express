import * as bcrypt from "bcrypt";
import User from "../models/User";

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User with this email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
    });

    return newUser;
  } catch (e) {
    throw e;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User was not found");

    return user;
  } catch (e) {
    throw e;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User was not found");

    return user;
  } catch (e) {
    throw e;
  }
};

export const getUsers = async () => {
  try {
    const users = await User.find();
    if (users.length === 0) throw new Error("Users were not found");

    return users;
  } catch (e) {
    throw e;
  }
};

export const updateUser = async (
  id: string,
  name: string,
  email: string,
  password: string
) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User was not found");

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== id) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    user.name = name;
    user.email = email;
    user.passwordHash = passwordHash;
    user.updatedAt = Date.now();
    user.save();

    return user;
  } catch (e) {
    throw e;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error("User was not found");

    return user;
  } catch (e) {
    throw e;
  }
};

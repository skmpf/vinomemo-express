import * as bcrypt from "bcrypt";
import User from "./user.model";
import { ExpressError } from "../../middleware/errorMiddleware";

const SALT_ROUNDS = 12;

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email }).collation({
    locale: "en",
    strength: 2,
  });
  if (existingUser) throw new UsedEmailError();

  return await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
  });
};

export const getUser = async (email: string) =>
  await User.findOne({ email }).collation({ locale: "en", strength: 2 });

export const getUserById = async (userId: string) =>
  await User.findById(userId).select("-passwordHash");

export const getUserByEmail = async (email: string) =>
  await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .select("-passwordHash");

export const getUsersByName = async (name: string) =>
  await User.find({ name })
    .collation({ locale: "en", strength: 2 })
    .select("-passwordHash");

export const getUsers = async () =>
  await User.find().select("-passwordHash").exec();

export const updateUser = async (
  userId: string,
  name?: string,
  email?: string,
  password?: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new ExpressError("Invalid request", 400);

  if (email) {
    const existingUser = await User.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new UsedEmailError();
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

class UsedEmailError extends ExpressError {
  constructor() {
    super("Email is already used", 406);
  }
}

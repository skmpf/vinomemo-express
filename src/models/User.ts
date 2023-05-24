import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", userSchema);

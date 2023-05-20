import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { CustomRequest } from "../types/express";

export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user._id);
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication failed", error);
    res.status(401).send("Unauthorized");
  }
};

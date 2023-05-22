import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../types/express";
import { getUserById } from "../controllers/user";

export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id = req.params.id;
    if (id && id !== decoded.user._id) throw new Error("Unauthorized");

    const user = await getUserById(decoded.user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication failed", error);
    res.status(401).send("Unauthorized");
  }
};

import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types/express";
import { getUserById } from "../controllers/user";

export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    const id = req.params.id;
    if (id && id !== decoded.user._id) throw new Error("User not allowed");

    const user = await getUserById(decoded.user._id);
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send(`Unauthorized - ${e.message}`);
  }
};

import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types/express";
import { getUserById } from "../api/user/user.controller";
import { getNoteById } from "../api/note/note.controller";

export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await getUserById(decoded.user._id);
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send(`Unauthorized - ${(e as Error).message}`);
  }
};

export const adminOnly = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).send("Forbidden access");
  }
  next();
};

export const checkPermissionsUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    if (req.params.id && req.params.id !== req.user?._id.toString()) {
      return res.status(403).send("Forbidden access");
    }
  }
  next();
};

export const checkPermissionsNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { creator } = await getNoteById(req.params.id);
  if (!req.user?.isAdmin) {
    if (creator && creator.toString() !== req.user?._id.toString()) {
      return res.status(403).send("Forbidden access");
    }
  }
  next();
};

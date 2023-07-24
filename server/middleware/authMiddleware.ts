import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types/express";
import { getUserById } from "../api/users/user.controller";
import { getNoteById } from "../api/notes/note.controller";

export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized - no jwt");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await getUserById(decoded.user._id);
    user && (req.user = user);
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
    return res.status(403).send("Unauthorized");
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
      return res.status(403).send("Unauthorized");
    }
  }
  next();
};

export const checkPermissionsNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const note = await getNoteById(req.params.id);
    const creator = note?.creator;

    if (!req.user?.isAdmin) {
      if (creator && creator.toString() !== req.user?._id.toString()) {
        return res.status(403).send("Unauthorized");
      }
    }
    next();
  } catch (error: unknown) {
    next(error);
  }
};

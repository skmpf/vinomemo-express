import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types/express";
import { getUserById } from "../api/users/user.controller";
import { getNoteById } from "../api/notes/note.controller";
import { ExpressError } from "./errorMiddleware";

export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("authorization")?.replace("Bearer ", "");
    if (!token) throw new ExpressError("Unauthorized - No JWT", 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await getUserById(decoded.user._id);
    user && (req.user = user);
    next();
  } catch (error: unknown) {
    const expressError = new ExpressError(`${(error as Error).message}`, 401);
    next(expressError);
  }
};

export const adminOnly = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.isAdmin) throw new UnauthorizedError();
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const checkPermissionsUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.isAdmin) {
      if (req.params.id && req.params.id !== req.user?._id.toString()) {
        throw new UnauthorizedError();
      }
    }
    next();
  } catch (error: unknown) {
    next(error);
  }
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
        throw new UnauthorizedError();
      }
    }
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export class UnauthorizedError extends ExpressError {
  constructor() {
    super("Unauthorized", 401);
  }
}

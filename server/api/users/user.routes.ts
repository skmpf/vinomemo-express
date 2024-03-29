import express, { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../../types/express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  adminOnly,
  authenticate,
  checkPermissionsUser,
} from "../../middleware/authMiddleware";
import {
  loginSchema,
  signupSchema,
  updateUserSchema,
} from "../../middleware/validationSchema";
import { validateSchema } from "../../middleware/validationMiddleware";
import {
  createUser,
  deleteUser,
  getUser,
  getUserByEmail,
  getUserById,
  getUsersByName,
  getUsers,
  updateUser,
} from "./user.controller";
import { ExpressError } from "../../middleware/errorMiddleware";

const router = express.Router();

router.post(
  "/signup",
  validateSchema(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const newUser = await createUser(name, email, password);
      const userData = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      };

      const token = jwt.sign({ user: userData }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      res.status(201).send({ token });
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.post(
  "/login",
  validateSchema(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const existingUser = email && (await getUser(email));
      if (!existingUser) throw new UnauthorizedError();

      const userData = {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      };

      const isPasswordCorrect =
        existingUser &&
        (await bcrypt.compare(password, existingUser.passwordHash));
      if (!isPasswordCorrect) throw new UnauthorizedError();

      const token = jwt.sign({ user: userData }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      res.status(200).send({ token });
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/users/me",
  authenticate,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).send(req.user);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/users",
  authenticate,
  adminOnly,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const users = await getUsers();
      res.status(200).send(users);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/users/search",
  authenticate,
  adminOnly,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { id, name, email } = req.query;
      let users = [];

      if (id) {
        const user = await getUserById(id.toString());
        users = user ? [user] : [];
      } else if (name) {
        users = await getUsersByName(name.toString());
      } else if (email) {
        const user = await getUserByEmail(email.toString());
        users = user ? [user] : [];
      } else {
        throw new ExpressError("Invalid search parameters", 400);
      }

      res.status(200).send(users);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/users/:id",
  authenticate,
  checkPermissionsUser,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const user = await getUserById(req.params.id);
      res.status(200).send(user);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.put(
  "/users/:id",
  authenticate,
  checkPermissionsUser,
  validateSchema(updateUserSchema),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const user = await updateUser(req.params.id, name, email, password);
      res.status(200).send(user);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.delete(
  "/users/:id",
  authenticate,
  checkPermissionsUser,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const user = await deleteUser(req.params.id);
      res.status(200).send(user);
    } catch (error: unknown) {
      next(error);
    }
  }
);

class UnauthorizedError extends ExpressError {
  constructor() {
    super("Unauthorized - Invalid credentials", 401);
  }
}

export default router;

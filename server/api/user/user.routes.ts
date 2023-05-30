import express, { Request, Response } from "express";
import { CustomRequest } from "../../types/express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  authenticate,
  checkPermissionsUser,
} from "../../middleware/authMiddleware";
import {
  loginValidator,
  signupValidator,
  updateUserValidator,
} from "../../middleware/validators";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
} from "./user.controller";

const router = express.Router();

router.post("/signup", signupValidator, async (req: Request, res: Response) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, email, password } = req.body;
    const newUser = await createUser(name, email, password);

    const token = jwt.sign({ user: newUser }, process.env.JWT_SECRET!);
    res.status(201).json({ user: newUser, token });
  } catch (error: unknown) {
    console.error("POST /signup", (error as Error).message);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", loginValidator, async (req: Request, res: Response) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;
    const existingUser = await getUserByEmail(email);

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!isPasswordCorrect) {
      return res.status(401).send("Password is incorrect");
    }

    const token = jwt.sign({ user: existingUser }, process.env.JWT_SECRET!);
    return res.status(200).json({ user: existingUser, token });
  } catch (error: unknown) {
    console.error("POST /login", (error as Error).message);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/users",
  authenticate,
  checkPermissionsUser,
  async (req: CustomRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).send("Forbidden access");
      }

      const users = await getUsers();
      res.status(200).json(users);
    } catch (error: unknown) {
      console.error("GET /users", (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/user/:id",
  authenticate,
  checkPermissionsUser,
  async (req: CustomRequest, res: Response) => {
    try {
      const user = await getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error: unknown) {
      console.error(`GET /user/${req.params.id}`, (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/user/:id",
  authenticate,
  checkPermissionsUser,
  updateUserValidator,
  async (req: CustomRequest, res: Response) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { name, email, password } = req.body;
      const user = await updateUser(req.params.id, name, email, password);
      res.status(200).send(user);
    } catch (error: unknown) {
      console.error(`PUT /user/${req.params.id}`, (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete(
  "/user/:id",
  authenticate,
  checkPermissionsUser,
  async (req: CustomRequest, res: Response) => {
    try {
      const user = await deleteUser(req.params.id);
      res.status(200).send(user);
    } catch (error: unknown) {
      console.error(`DELETE /user/${req.params.id}`, (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;

import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticate } from "../middlewares/authMiddleware";
import { CustomRequest } from "../types/express";
import {
  loginValidator,
  signupValidator,
  updateUserValidator,
} from "../utils/validators";
import { validationResult } from "express-validator";

const router = express.Router();

router.post("/signup", signupValidator, async (req: Request, res: Response) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
    });

    const token = jwt.sign({ user: newUser }, process.env.JWT_SECRET);
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("POST /signup", error);
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
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).send("User does not exist");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (isPasswordCorrect) {
      const token = jwt.sign({ user: existingUser }, process.env.JWT_SECRET);
      return res.status(200).json({ user: existingUser, token });
    }

    res.status(401).send("Password is incorrect");
  } catch (error) {
    console.error("POST /login", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/users",
  authenticate,
  async (req: CustomRequest, res: Response) => {
    try {
      const users = await User.find();

      if (users.length === 0) {
        return res.status(204).send("No users found");
      }

      res.status(200).json(users);
    } catch (error) {
      console.error("GET /users", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/user/:id",
  authenticate,
  async (req: CustomRequest, res: Response) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(`GET /user/${req.params.id}`, error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/user/:id",
  authenticate,
  updateUserValidator,
  async (req: CustomRequest, res: Response) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { name, email, password } = req.body;
      const id = req.params.id;

      if (id !== req.user._id) {
        return res.status(401).send("Unauthorized");
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await User.findByIdAndUpdate(id, {
        name,
        email,
        passwordHash,
        updatedAt: Date.now(),
      });

      res.status(200).send();
    } catch (error) {
      console.error(`PUT /user/${req.params.id}`, error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete(
  "/user/:id",
  authenticate,
  async (req: CustomRequest, res: Response) => {
    try {
      const id = req.params.id;

      if (id !== req.user._id) {
        return res.status(401).send("Unauthorized");
      }

      await User.findByIdAndDelete(req.params.id);
      res.status(200).send();
    } catch (error) {
      console.error(`DELETE /user/${req.params.id}`, error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;

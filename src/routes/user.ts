import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticate } from "../middlewares/authMiddleware";
import { CustomRequest } from "../types/express";
const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).send("User already exists");
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        passwordHash,
      });
      const newUser = await user.save();
      const token = jwt.sign({ user: newUser }, process.env.JWT_SECRET);
      res.status(201).json({ user: newUser, token });
    }
  } catch (error) {
    console.error("POST /signup", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.passwordHash
      );
      if (isPasswordCorrect) {
        const token = jwt.sign({ user: existingUser }, process.env.JWT_SECRET);
        res.status(200).json({ user: existingUser, token });
      } else {
        res.status(401).send("Password is incorrect");
      }
    } else {
      res.status(401).send("User does not exist");
    }
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
        res.status(204).send("No users found");
      } else {
        res.status(200).json(users);
      }
      return;
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
        res.status(404).send("User not found");
      } else {
        res.status(200).json(user);
      }
    } catch (error) {
      console.error(`GET /user/${req.params.id}`, error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put("/user", authenticate, async (req: CustomRequest, res: Response) => {
  try {
    const { id, name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        passwordHash,
        updatedAt: Date.now(),
      },
      { runValidators: true }
    );
    res.status(200).send();
  } catch (error) {
    console.error(`PATCH /user/${req.params.id}`, error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete(
  "/user/:id",
  authenticate,
  async (req: CustomRequest, res: Response) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).send();
    } catch (error) {
      console.error(`DELETE /user/${req.params.id}`, error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;

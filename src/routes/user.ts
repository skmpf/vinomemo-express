import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
const router = express.Router();

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      res.status(204).send("No users found");
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    console.error("GET /users", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/user/:id", async (req: Request, res: Response) => {
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
});

router.patch(
  "/user/:id",

  async (req: Request, res: Response) => {
    try {
      const { id, name, email, password } = req.body;
      await User.findByIdAndUpdate(
        id,
        {
          name,
          email,
          passwordHash: await bcrypt.hash(password, 10),
          updatedAt: Date.now(),
        },
        { runValidators: true }
      );
      res.status(200).send();
    } catch (error) {
      console.error(`PATCH /user/${req.params.id}`, error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete("/user/:id", async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send();
  } catch (error) {
    console.error(`DELETE /user/${req.params.id}`, error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/signup",

  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).send("User already exists");
      } else {
        const user = new User({
          name,
          email,
          passwordHash: await bcrypt.hash(password, 10),
        });
        const newUser = await user.save();
        res.status(201).json(newUser);
      }
    } catch (error) {
      console.error("POST /signup", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

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
        res.status(200).json();
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

export default router;

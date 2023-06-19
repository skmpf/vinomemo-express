import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserRoutes from "./api/user/user.routes";
import NoteRoutes from "./api/note/note.routes";

dotenv.config();

const app: Express = express();
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "dev"
        ? "http://localhost:3000"
        : process.env.VINOMEMO_APP_URL,
    credentials: true,
  })
);

if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "prod") {
  mongoose.connect(process.env.MONGODB_URI!);
}

app.use(bodyParser.json());
app.use(UserRoutes);
app.use(NoteRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to VinoMemo API");
});
app.get("*", (req: Request, res: Response) => {
  res.status(404).send("404 Not Found");
});

export default app;

import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import UserRoutes from "./routes/user";
import NoteRoutes from "./routes/note";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

app.use(bodyParser.json());
app.use(UserRoutes);
app.use(NoteRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to VinoMemo API");
});
app.get("*", (req: Request, res: Response) => {
  res.status(404).send("404 Not Found");
});
app.listen(port, () => {
  console.log(`⚡️[server]: Server is listening at http://localhost:${port}`);
});

export { app };

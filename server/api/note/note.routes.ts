import express, { Request, Response } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUserId,
  getNotes,
  updateNote,
} from "./note.controller";
import {
  adminOnly,
  authenticate,
  checkPermissionsNote,
  checkPermissionsUser,
} from "../../middleware/authMiddleware";
const router = express.Router();

router.post("/note", authenticate, async (req: Request, res: Response) => {
  try {
    const newNote = await createNote(req.body);
    res.status(201).json(newNote);
  } catch (error: unknown) {
    console.error("POST /note", (error as Error).message);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/notes",
  authenticate,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const notes = await getNotes();
      res.status(200).json(notes);
    } catch (error: unknown) {
      console.error("GET /notes", (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/user/:id/notes",
  authenticate,
  checkPermissionsUser,
  async (req: Request, res: Response) => {
    try {
      const note = await getNotesByUserId(req.params.id);
      res.status(200).json(note);
    } catch (error: unknown) {
      console.error(
        `GET /user/${req.params.id}/notes`,
        (error as Error).message
      );
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/note/:id",
  authenticate,
  checkPermissionsNote,
  async (req: Request, res: Response) => {
    try {
      const note = await getNoteById(req.params.id);
      res.status(200).json(note);
    } catch (error: unknown) {
      console.error(`GET /note/${req.params.id}`, (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/note/:id",
  authenticate,
  checkPermissionsNote,
  async (req: Request, res: Response) => {
    try {
      const note = await updateNote(req.params.id, req.body);
      res.status(200).json(note);
    } catch (error: unknown) {
      console.error(`PATCH /note/${req.params.id}`, (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete(
  "/note/:id",
  authenticate,
  checkPermissionsNote,
  async (req: Request, res: Response) => {
    try {
      const note = await deleteNote(req.params.id);
      res.status(200).json(note);
    } catch (error: unknown) {
      console.error(`DELETE /note/${req.params.id}`, (error as Error).message);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;

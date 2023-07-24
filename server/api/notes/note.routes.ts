import express, { NextFunction, Request, Response } from "express";
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
import { validateSchema } from "../../middleware/validationMiddleware";
import { noteSchema } from "../../middleware/validationSchema";
import { CustomRequest } from "../../types/express";
const router = express.Router();

router.post(
  "/notes",
  authenticate,
  validateSchema(noteSchema),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const newNote = await createNote({ ...req.body, creator: req.user?._id });
      res.status(201).send(newNote);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/notes",
  authenticate,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notes = await getNotes();
      res.status(200).send(notes);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/users/:id/notes",
  authenticate,
  checkPermissionsUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await getNotesByUserId(req.params.id);
      res.status(200).send(note);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get(
  "/notes/:id",
  authenticate,
  checkPermissionsNote,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await getNoteById(req.params.id);
      res.status(200).send(note);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.put(
  "/notes/:id",
  authenticate,
  checkPermissionsNote,
  validateSchema(noteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await updateNote(req.params.id, req.body);
      res.status(200).send(note);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.delete(
  "/notes/:id",
  authenticate,
  checkPermissionsNote,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await deleteNote(req.params.id);
      res.status(200).send(note);
    } catch (error: unknown) {
      next(error);
    }
  }
);

export default router;

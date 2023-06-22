import Note from "../../server/api/note/note.model";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUserId,
  getNotes,
  updateNote,
} from "../../server/api/note/note.controller";
import { mockNote } from "./mocks/note";

jest.mock("../../server/api/note/note.model");

afterEach(async () => {
  await Note.deleteMany();
  jest.clearAllMocks();
});

describe("Note Controller", () => {
  describe("createUser", () => {
    it("should create a new user", async () => {
      (Note.create as jest.Mock).mockResolvedValueOnce(mockNote);

      await expect(createNote(mockNote)).resolves.toEqual(mockNote);

      expect(Note.create).toHaveBeenCalledWith(mockNote);
    });
  });

  describe("getNoteById", () => {
    it("should get a note by ID", async () => {
      (Note.findById as jest.Mock).mockResolvedValueOnce(mockNote);

      await expect(getNoteById(mockNote._id.toString())).resolves.toEqual(
        mockNote
      );

      expect(Note.findById).toHaveBeenCalledWith(mockNote._id.toString());
    });
  });

  describe("getNotesByUserId", () => {
    it("should get all notes by user ID", async () => {
      (Note.find as jest.Mock).mockResolvedValueOnce(Array(3).fill(mockNote));

      await expect(
        getNotesByUserId(mockNote.creator.toString())
      ).resolves.toEqual(Array(3).fill(mockNote));

      expect(Note.find).toHaveBeenCalledWith({
        creator: mockNote.creator.toString(),
      });
    });
  });

  describe("getNotes", () => {
    it("should get all notes", async () => {
      (Note.find as jest.Mock).mockResolvedValueOnce(Array(3).fill(mockNote));

      await expect(getNotes()).resolves.toEqual(Array(3).fill(mockNote));

      expect(Note.find).toHaveBeenCalledWith();
    });
  });

  describe("updateNote", () => {
    it("should update a note by ID", async () => {
      const updatedNote = {
        ...mockNote,
        information: { ...mockNote.information, name: "updated name" },
      };

      (Note.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedNote);

      await expect(
        updateNote(mockNote._id.toString(), updatedNote)
      ).resolves.toEqual(updatedNote);

      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        mockNote._id.toString(),
        updatedNote,
        { new: true }
      );
    });
  });

  describe("deleteNote", () => {
    it("should delete a note by ID", async () => {
      (Note.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(mockNote);

      await expect(deleteNote(mockNote._id.toString())).resolves.toEqual(
        mockNote
      );

      expect(Note.findByIdAndDelete).toHaveBeenCalledWith(
        mockNote._id.toString()
      );
    });
  });
});

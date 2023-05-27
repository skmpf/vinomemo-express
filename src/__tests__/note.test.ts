import Note from "../models/Note";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUserId,
  getNotes,
  updateNote,
} from "../controllers/note";
import { mockNote } from "./mocks/note";

jest.mock("../models/Note");

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

    it("should throw an error if note is not found", async () => {
      const nonExistentId = "123456789012345678901234";
      (Note.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(getNoteById(nonExistentId)).rejects.toThrow(
        "Note was not found"
      );

      expect(Note.findById).toHaveBeenCalledWith(nonExistentId);
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

    it("should throw an error if notes are not found", async () => {
      (Note.find as jest.Mock).mockResolvedValueOnce([]);

      await expect(
        getNotesByUserId(mockNote.creator.toString())
      ).rejects.toThrow("Notes were not found");

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

    it("should throw an error if notes are not found", async () => {
      (Note.find as jest.Mock).mockResolvedValueOnce([]);

      await expect(getNotes()).rejects.toThrow("Notes were not found");

      expect(Note.find).toHaveBeenCalled();
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

    it("should throw an error when updating a non-existent note", async () => {
      const nonExistentId = "123456789012345678901234";
      (Note.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      await expect(updateNote(nonExistentId, mockNote)).rejects.toThrow(
        "Note was not found"
      );

      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        nonExistentId,
        mockNote,
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

    it("should throw an error when deleting a non-existent note", async () => {
      const nonExistentId = "123456789012345678901234";
      (Note.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(null);

      await expect(deleteNote(nonExistentId)).rejects.toThrow(
        "Note was not found"
      );

      expect(Note.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
    });
  });
});

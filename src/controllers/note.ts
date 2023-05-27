import Note, { INote } from "../models/Note";

export const createNote = async (noteData: INote) => {
  try {
    const newNote = await Note.create(noteData);
    return newNote;
  } catch (e) {
    throw e;
  }
};

export const getNoteById = async (noteId: string) => {
  try {
    const note = await Note.findById(noteId);
    if (!note) throw new Error("Note was not found");
    return note;
  } catch (e) {
    throw e;
  }
};

export const getNotes = async () => {
  try {
    const notes = await Note.find();
    if (notes.length === 0) throw new Error("Notes were not found");
    return notes;
  } catch (e) {
    throw e;
  }
};

export const getNotesByUserId = async (userId: string) => {
  try {
    const notes = await Note.find({ creator: userId });

    if (notes.length === 0) throw new Error("Notes were not found");

    return notes;
  } catch (e) {
    throw e;
  }
};

export const updateNote = async (
  noteId: string,
  updatedNoteData: Partial<INote>
) => {
  try {
    const note = await Note.findByIdAndUpdate(noteId, updatedNoteData, {
      new: true,
    });

    if (!note) throw new Error("Note was not found");

    return note;
  } catch (e) {
    throw e;
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    const note = await Note.findByIdAndDelete(noteId);

    if (!note) throw new Error("Note was not found");

    return note;
  } catch (e) {
    throw e;
  }
};

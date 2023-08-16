import Note, { INote } from "./note.model";

export const createNote = async (noteData: INote) =>
  await Note.create(noteData);

export const getNoteById = async (noteId: string) =>
  await Note.findById(noteId);

export const getNotes = async () => await Note.find();

export const getNotesByName = async (name: string) => {
  const regex = new RegExp(name, "i");
  return await Note.find({ "information.name": regex });
};

export const getNotesByUserId = async (userId: string) =>
  await Note.find({ creator: userId });

export const updateNote = async (
  noteId: string,
  updatedNoteData: Partial<INote>
) =>
  await Note.findByIdAndUpdate(noteId, updatedNoteData, {
    new: true,
  });

export const deleteNote = async (noteId: string) =>
  await Note.findByIdAndDelete(noteId);

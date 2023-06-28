import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../server/app";
import Note from "../../server/api/notes/note.model";
import User from "../../server/api/users/user.model";
import * as userController from "../../server/api/users/user.controller";
import * as noteController from "../../server/api/notes/note.controller";

let userId: string;
let noteId: string;
let userToken: string;

const mockUser = {
  name: "note integration test user",
  email: "note_integration_test@email.com",
  password: "password",
};

const mockNote = {
  information: {
    name: "Test Note",
  },
  creator: new mongoose.Types.ObjectId(),
};

beforeEach(async () => {
  const { name, email, password } = mockUser;
  const user = await userController.createUser(name, email, password);
  const token = jwt.sign({ user }, process.env.JWT_SECRET!);
  userToken = token;
  mockNote.creator = new mongoose.Types.ObjectId(user._id);
  const note = await noteController.createNote(mockNote);
  userId = user._id.toString();
  noteId = note._id.toString();
});

afterEach(async () => {
  await Note.deleteMany();
  await User.deleteMany();
  jest.clearAllMocks();
});

describe("Note API", () => {
  it("should create a new note", async () => {
    const response = await request(app)
      .post("/notes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ...mockNote, information: { name: "Test Note creation" } });

    expect(response.statusCode).toBe(201);
    expect(response.body._id).toBeDefined();
    expect(response.body.information.name).toEqual("Test Note creation");
    expect(response.body.creator).toEqual(mockNote.creator.toString());
  });

  it("should get all notes", async () => {
    const getUserByIdOverride = async (userId: string) => {
      const user = await userController.getUserById(userId);
      return { ...user, isAdmin: true };
    };
    jest
      .spyOn(userController, "getUserById")
      .mockImplementationOnce(
        getUserByIdOverride as typeof userController.getUserById
      );

    const response = await request(app)
      .get("/notes")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body[0]._id).toEqual(noteId);
    expect(response.body[0].creator).toEqual(userId);
    expect(response.body[0].information.name).toEqual(
      mockNote.information.name
    );
  });

  it("should get notes by user ID", async () => {
    const response = await request(app)
      .get(`/users/${userId}/notes`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body[0]._id).toEqual(noteId);
    expect(response.body[0].creator).toEqual(userId);
    expect(response.body[0].information.name).toEqual(
      mockNote.information.name
    );
  });

  it("should get a note by ID", async () => {
    const response = await request(app)
      .get(`/notes/${noteId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toEqual(noteId);
    expect(response.body.creator).toEqual(userId);
    expect(response.body.information.name).toEqual(mockNote.information.name);
  });

  it("should update a note", async () => {
    const response = await request(app)
      .put(`/notes/${noteId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        information: {
          name: "Test Note updated",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toEqual(noteId);
    expect(response.body.information.name).toEqual("Test Note updated");
    expect(response.body.creator).toEqual(mockNote.creator.toString());
  });

  it("should delete a note", async () => {
    const response = await request(app)
      .delete(`/notes/${noteId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toEqual(noteId);
    expect(response.body.information.name).toEqual("Test Note");
    expect(response.body.creator).toEqual(mockNote.creator.toString());
  });
});

import request from "supertest";
import mongoose from "mongoose";
import app from "../../server/app";

describe("Server", () => {
  it("should respond with 'Welcome to VinoMemo API' on GET '/'", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Welcome to VinoMemo API");
  });

  it("should respond with '404 Not Found' on GET an invalid route", async () => {
    const response = await request(app).get("/invalid-route");
    expect(response.status).toBe(404);
    expect(response.text).toBe("404 Not Found");
  });
});

describe("Database Connection", () => {
  it("should not connect to the MongoDB database in other modes", async () => {
    // Mock the `connect` method of mongoose
    const connectMock = jest.spyOn(mongoose, "connect");

    // Call the app to trigger the database connection
    app;

    // Expect the `connect` method not to be called
    expect(connectMock).not.toHaveBeenCalled();
  });
});

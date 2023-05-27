import mongoose from "mongoose";

export const mockNote = {
  _id: new mongoose.Types.ObjectId("64692230d2000dfdebe4c0c4"),
  information: {
    name: "Test Note",
    country: "Test Country",
    region: "Test Region",
    grapes: ["Test Grape"],
    producer: "Test Producer",
    vintage: 2020,
    alcohol: 13.5,
  },
  appearance: {
    intensity: 3,
    color: "Test Color",
  },
  nose: {
    intensity: 3,
    aromas: ["Test Aroma"],
  },
  palate: {
    sweetness: 3,
    acidity: 3,
    tannin: 3,
    alcohol: 3,
    body: 3,
    intensity: 3,
    flavors: ["Test Flavor"],
    finish: 3,
  },
  conclusion: {
    rating: 3,
    comments: "Test Comments",
  },
  creator: new mongoose.Types.ObjectId("5f8d0f7b4f4d4b1f3c0b0f7b"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

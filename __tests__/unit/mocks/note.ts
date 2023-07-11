import mongoose from "mongoose";

export const mockNote = {
  _id: new mongoose.Types.ObjectId("64692230d2000dfdebe4c0c4"),
  information: {
    name: "Test Note",
    country: "Test Country",
    region: "Test Region",
    grapes: "Test Grape",
    producer: "Test Producer",
    vintage: 2020,
    alcohol: 13.5,
  },
  appearance: {
    intensity: "light",
    color: "Test Color",
    variant: "Test Variant",
  },
  nose: {
    intensity: "light",
    aromas: "Test Aroma",
  },
  palate: {
    sweetness: "dry",
    acidity: "medium",
    tannin: "medium",
    alcohol: "medium",
    body: "medium",
    intensity: "medium",
    flavors: "Test Flavor",
    finish: "medium",
  },
  conclusion: {
    rating: "Accpetable",
    comments: "Test Comments",
  },
  creator: new mongoose.Types.ObjectId("5f8d0f7b4f4d4b1f3c0b0f7b"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

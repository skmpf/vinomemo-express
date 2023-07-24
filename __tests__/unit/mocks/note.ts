import mongoose from "mongoose";

export const mockNote = {
  _id: new mongoose.Types.ObjectId("64692230d2000dfdebe4c0c4"),
  information: {
    name: "Frog's Leap Merlot",
    country: "USA",
    region: "Napa Valley",
    grapes: "Merlot",
    producer: "Rutherford",
    vintage: 2015,
    alcohol: "12.0",
  },
  appearance: {
    intensity: "pronounced",
    color: "red",
    variant: "ruby",
  },
  nose: {
    intensity: "pronounced",
    aromas:
      "primary aromas of raspberry, black cherry, black plum, bell pepper\nsecondary aromas of vanilla, chocolate\ntertiary aromas of earth, tobacco",
  },
  palate: {
    sweetness: "dry",
    acidity: "high",
    tannin: "high",
    alcohol: "medium",
    body: "full",
    intensity: "pronounced",
    flavors:
      "primary flavours of raspberry, black cherry, black plum, mint secondary flavours of vanilla, chocolate tertiary flavours of earth, tobacco, dried fruit",
    finish: "long",
  },
  conclusions: {
    quality: "outstanding",
    comments: "would buy more",
  },
  creator: new mongoose.Types.ObjectId("5f8d0f7b4f4d4b1f3c0b0f7b"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

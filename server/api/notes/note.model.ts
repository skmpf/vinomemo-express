import mongoose from "mongoose";

export interface INote {
  information: {
    name: string;
    country?: string;
    region?: string;
    grapes?: string[];
    producer?: string;
    vintage?: number;
    alcohol?: number;
  };
  appearance?: {
    intensity?: number;
    color?: string;
  };
  nose?: {
    intensity?: number;
    aromas?: string[];
  };
  palate?: {
    sweetness?: number;
    acidity?: number;
    tannin?: number;
    alcohol?: number;
    body?: number;
    intensity?: number;
    flavors?: string[];
    finish?: number;
  };
  conclusion?: {
    comments?: string;
    rating?: number;
  };
  creator: mongoose.Types.ObjectId;
}

const noteSchema = new mongoose.Schema(
  {
    information: {
      name: { type: String, required: true },
      country: String,
      region: String,
      grapes: { type: [String], default: undefined },
      producer: String,
      vintage: Number,
      alcohol: Number,
    },
    appearance: {
      intensity: Number,
      color: String,
    },
    nose: {
      intensity: Number,
      aromas: { type: [String], default: undefined },
    },
    palate: {
      sweetness: Number,
      acidity: Number,
      tannin: Number,
      alcohol: Number,
      body: Number,
      intensity: Number,
      flavors: { type: [String], default: undefined },
      finish: Number,
    },
    conclusion: {
      comments: String,
      rating: Number,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<INote>("Note", noteSchema);

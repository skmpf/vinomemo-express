import mongoose from "mongoose";

export interface INote {
  information: {
    name: string;
    country?: string;
    region?: string;
    grapes?: string;
    producer?: string;
    vintage?: number;
    alcohol?: string;
  };
  appearance?: {
    intensity?: string;
    color?: string;
    variant?: string;
  };
  nose?: {
    intensity?: string;
    aromas?: string;
  };
  palate?: {
    sweetness?: string;
    acidity?: string;
    tannin?: string;
    alcohol?: string;
    body?: string;
    intensity?: string;
    flavors?: string;
    finish?: string;
  };
  conclusions?: {
    quality?: string;
    comments?: string;
  };
  creator: mongoose.Types.ObjectId;
}

const noteSchema = new mongoose.Schema(
  {
    information: {
      name: { type: String, required: true },
      country: String,
      region: String,
      grapes: String,
      producer: String,
      vintage: Number,
      alcohol: String,
    },
    appearance: {
      intensity: String,
      color: String,
      variant: String,
    },
    nose: {
      intensity: String,
      aromas: String,
    },
    palate: {
      sweetness: String,
      acidity: String,
      tannin: String,
      alcohol: String,
      body: String,
      intensity: String,
      flavors: String,
      finish: String,
    },
    conclusions: {
      quality: String,
      comments: String,
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

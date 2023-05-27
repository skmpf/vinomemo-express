import mongoose, { InferSchemaType } from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    information: {
      name: { type: String, required: true },
      country: String,
      region: String,
      grapes: [String],
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
      aromas: [String],
    },
    palate: {
      sweetness: Number,
      acidity: Number,
      tannin: Number,
      alcohol: Number,
      body: Number,
      intensity: Number,
      flavors: [String],
      finish: Number,
    },
    conclusion: {
      comments: String,
      rating: Number,
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type INote = InferSchemaType<typeof noteSchema>;

export default mongoose.model("Note", noteSchema);

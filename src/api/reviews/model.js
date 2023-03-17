import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewsSchema = new Schema(
  {
    comment: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Review", reviewsSchema);

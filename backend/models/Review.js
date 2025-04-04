const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true },
  reviews: { type: Object, required: true }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

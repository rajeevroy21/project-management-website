const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// **Save or Update Reviews**
router.post("/reviews", async (req, res) => {
  const { batchNumber, reviews } = req.body;

  try {
    let existingReview = await Review.findOne({ batchNumber });

    if (existingReview) {
      existingReview.reviews = reviews;
      await existingReview.save();
    } else {
      const newReview = new Review({ batchNumber, reviews });
      await newReview.save();
    }

    res.json({ message: "Reviews saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error saving reviews" });
  }
});

// **Fetch Reviews by Batch Number**
router.get("/reviews/:batchNumber", async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const reviewData = await Review.findOne({ batchNumber });

    if (reviewData) {
      res.json({ reviews: reviewData.reviews });
    } else {
      res.json({ reviews: {} });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

module.exports = router;

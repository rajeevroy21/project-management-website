// routes/batchRoutes.js
const express = require('express');
const router = express.Router();
const BatchModel = require('../models/Title'); 

// Route to create a new batch
router.post('/createBatch', async (req, res) => {
    const { batchNumber, name } = req.body;

    if (!batchNumber || !name) {
        return res.status(400).json({ error: "Batch number and name are required." });
    }

    try {
        // Create a new batch
        const newBatch = new BatchModel({
            batchNumber: batchNumber,
            name: name
        });

        // Save to database
        await newBatch.save();

        res.status(201).json({ message: "Batch created successfully.", batch: newBatch });
    } catch (error) {
        console.error("Error creating batch:", error);
        if (error.code === 11000) { // Duplicate key error
            res.status(409).json({ error: "Batch number already exists." });
        } else {
            res.status(500).json({ error: "Internal server error." });
        }
    }
});
router.get('/getTitle/:batchNumber', async (req, res) => {
    const { batchNumber } = req.params;

    try {
        // Find the batch by batchNumber
        const batch = await BatchModel.findOne({ batchNumber: batchNumber });

        if (batch) {
            res.status(200).json({ title: batch.name });
        } else {
            res.status(404).json({ error: "Batch not found." });
        }
    } catch (error) {
        console.error("Error fetching title:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
// Route to create or update a batch title
router.put('/getTitle/:batchNumber', async (req, res) => {
    const { batchNumber } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Batch title is required." });
    }

    try {
        // Create or update the batch title
        const result = await BatchModel.updateOne(
            { batchNumber: batchNumber },  // Find document by batchNumber
            { $set: { name: name } },      // Update the title
            { upsert: true }               // Create if not found
        );

        if (result.upsertedCount > 0) {
            res.status(201).json({ message: "Batch title created successfully." });
        } else {
            res.status(200).json({ message: "Batch title updated successfully." });
        }
    } catch (error) {
        console.error("Error updating title:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});


module.exports = router;

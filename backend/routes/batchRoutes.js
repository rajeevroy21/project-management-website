const express = require('express');
const mongoose = require('mongoose');
const Batch = require('../models/Batch'); // Adjust the path as needed

const router = express.Router();

// Create a new batch
router.post('/', async(req, res) => {
    try {
        const { title, students, password } = req.body;
        const newBatch = new Batch({ title, students, password });
        const savedBatch = await newBatch.save();
        res.status(201).json(savedBatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all batches
router.get('/', async(req, res) => {
    try {
        const batches = await Batch.find().populate('students');
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single batch by ID
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findById(id).populate('students');
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a batch by ID
router.put('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const updatedBatch = await Batch.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('students');
        if (!updatedBatch) return res.status(404).json({ error: 'Batch not found' });
        res.status(200).json(updatedBatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a batch by ID
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const deletedBatch = await Batch.findByIdAndDelete(id);
        if (!deletedBatch) return res.status(404).json({ error: 'Batch not found' });
        res.status(200).json({ message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const XLSX = require('xlsx');
// Update project title for batch and all students in the batch
router.patch('/:id/project-title', async(req, res) => {
    try {
        const { id } = req.params;
        const { projectTitle } = req.body;

        if (!projectTitle) {
            return res.status(400).json({ error: 'Project title is required' });
        }

        // Update batch project title
        const updatedBatch = await Batch.findByIdAndUpdate(
            id, { $set: { projectTitle } }, { new: true }
        ).populate('students');

        if (!updatedBatch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        // Update all students in the batch
        await Student.updateMany({ batchId: id }, { $set: { projectTitle } });

        res.status(200).json({
            success: true,
            message: 'Project title updated successfully',
            projectTitle: updatedBatch.projectTitle,
        });
    } catch (error) {
        console.error('Error updating project title:', error);
        res.status(500).json({ error: 'Server error while updating project title' });
    }
});



module.exports = router; // Use CommonJS export
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');

const router = express.Router();

// Middleware for verifying JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies
    if (!token) return res.status(401).json({ message: 'Unauthorized, no token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
// Register a new faculty
router.post('/', async (req, res) => {
    try {
        const { facultyId, password, role } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newFaculty = new Faculty({ facultyId, password: hashedPassword, role });
        const savedFaculty = await newFaculty.save();
        res.status(201).json(savedFaculty);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Faculty ID must be unique' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Login faculty
// Login faculty
router.post('/login', async (req, res) => {
    try {
        const { facultyId, password } = req.body;

        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const payload = { facultyId: faculty.facultyId, role: faculty.role, id: faculty._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000
        });

        // Send role along with response
        res.status(200).json({ message: 'Login successful', role: faculty.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user role by ID
// Get user role by ID
router.get('/role/:userId', verifyToken, async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ facultyId: req.params.userId });
        if (!faculty) return res.status(404).json({ message: 'User not found' });

        // Add the 'message' field to the response
        res.json({ message: 'Role retrieved successfully', role: faculty.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all faculties
router.get('/', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.status(200).json(faculties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single faculty by ID
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
        res.status(200).json(faculty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a faculty by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedFaculty) return res.status(404).json({ error: 'Faculty not found' });
        res.status(200).json(updatedFaculty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a faculty by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!deletedFaculty) return res.status(404).json({ error: 'Faculty not found' });
        res.status(200).json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

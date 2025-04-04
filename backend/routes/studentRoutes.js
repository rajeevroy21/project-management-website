const express = require('express');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const router = express.Router();
// Get student details with batch information
router.get('/details/:registrationNumber', async(req, res) => {
    try {
        const { registrationNumber } = req.params;
        const student = await Student.findOne({
            registrationNumber: { $regex: new RegExp(`^${registrationNumber.trim()}$`, 'i') }
        }).populate('batchId');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch batch details
        const batch = await Batch.findById(student.batchId).populate('students');

        res.status(200).json({ student, batch });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get student information including marks
router.get('/:registrationNumber', async(req, res) => {
    try {
        const { registrationNumber } = req.params;
        const student = await Student.findOne({
            registrationNumber: { $regex: new RegExp(`^${registrationNumber.trim()}$`, 'i') }
        }).populate('batchId');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Initialize reviews array if it doesn't exist
        if (!student.reviews) {
            student.reviews = [];
            await student.save();
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Update project title for all students in a batch
router.post('/batches/:batchId/update-project', async(req, res) => {
    try {
        const { batchId } = req.params;
        const { projectTitle } = req.body;

        if (!projectTitle) {
            return res.status(400).json({ message: 'Project title is required' });
        }

        const updatedStudents = await Student.updateMany({ batchId }, { $set: { projectTitle } });
        if (updatedStudents.matchedCount === 0) {
            return res.status(404).json({ message: 'No students found for this batch' });
        }

        const updatedBatch = await Batch.findByIdAndUpdate(batchId, { $set: { projectTitle } }, { new: true });
        if (!updatedBatch) return res.status(404).json({ message: 'Batch not found' });

        res.json({ success: true, projectTitle, message: 'Project title updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Check if registration numbers exist
router.post('/check-students', async(req, res) => {
    const { regNos } = req.body;

    if (!regNos || !Array.isArray(regNos) || regNos.length === 0) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    try {
        const existingStudents = await Student.find({ registrationNumber: { $in: regNos } });

        if (existingStudents.length > 0) {
            const existingRegNos = existingStudents.map(student => student.registrationNumber);
            return res.status(400).json({
                error: 'Some registration numbers already exist',
                existingRegNos
            });
        }

        res.status(200).json({ message: 'All registration numbers are unique' });
    } catch (error) {
        console.error('Error checking students:', error);
        res.status(500).json({ error: 'Server error while checking registration numbers' });
    }
});

// Create a new student
router.post('/', async(req, res) => {
    const { registrationNumber, section, batchTitle, batchId, password } = req.body;

    if (!registrationNumber || !section || !batchTitle || !batchId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if registration number already exists
        const existingStudent = await Student.findOne({ registrationNumber });
        if (existingStudent) {
            return res.status(400).json({
                error: 'Registration number already exists',
                existingRegNo: registrationNumber
            });
        }

        // Hash password and create student
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStudent = new Student({
            registrationNumber,
            section,
            batchTitle,
            batchId,
            password: hashedPassword,
        });

        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        console.error('Error saving student:', error);
        res.status(500).json({ error: 'Server error while creating student' });
    }
});

// Get all students
router.get('/', async(req, res) => {
    try {
        const students = await Student.find().populate('batchId');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single student by ID
router.get('/:id', async(req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('batchId');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a student
router.put('/:id', async(req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        ).populate('batchId');

        if (!updatedStudent) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json(updatedStudent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a student
router.delete('/:id', async(req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student login
router.post('/login', async(req, res) => {
    const { registrationNumber, password } = req.body;

    if (!registrationNumber || !password) {
        return res.status(400).json({ error: 'Registration number and password are required' });
    }

    try {
        const student = await Student.findOne({ registrationNumber });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({
                studentId: student._id,
                registrationNumber: student.registrationNumber
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            student: {
                id: student._id,
                registrationNumber: student.registrationNumber,
                batchTitle: student.batchTitle
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
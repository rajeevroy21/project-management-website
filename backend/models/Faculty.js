const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    facultyId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['DEO', 'Project Coordinator', 'Faculty'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
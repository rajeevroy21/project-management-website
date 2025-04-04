const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Z0-9]+$/
    },
    section: {
        type: String,
        required: true
    },
    batchTitle: {
        type: String,
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
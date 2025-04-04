const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
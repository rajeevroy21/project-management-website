const mongoose = require('mongoose');

// Define the schema for Title
const TitleSchema = new mongoose.Schema({
    batchNumber: {
        type: String,
        required: true,
       
    },
    name: {
        type: String,
        required: true
    }
});

// Check if the model already exists to prevent OverwriteModelError
const TitleModel = mongoose.models.Title || mongoose.model('Title', TitleSchema);

module.exports = TitleModel;

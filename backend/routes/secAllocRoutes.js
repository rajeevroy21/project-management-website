const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const router = express.Router();
const storageDirectory = path.join(__dirname, '..', 'documents', 'domain_faculty');
const excelFilePath = path.join(storageDirectory, 'secAlloc.xlsx');

// Ensure the storage directory exists
if (!fs.existsSync(storageDirectory)) {
    fs.mkdirSync(storageDirectory, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageDirectory);
    },
    filename: (req, file, cb) => {
        const filePath = path.join(storageDirectory, 'secAlloc.xlsx');
        
        // Delete the existing file before saving a new one
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        cb(null, 'secAlloc.xlsx');
    }
});

const upload = multer({ storage });

// 📌 Route 1: Upload the secAlloc Excel file
router.post('/uploadSecAlloc', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', fileName: req.file.filename });
});
// 📌 Get All Unique Sections
router.get('/getSections', (req, res) => {
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'Excel file not found' });
    }

    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON format
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headerRow = jsonData[0]; // First row as column names
        
        // Get the index of the Section column
        const sectionIndex = headerRow.indexOf('Section');

        if (sectionIndex === -1) {
            return res.status(404).json({ message: 'Section column not found in Excel' });
        }

        const sections = new Set(); // Use Set to store unique values

        jsonData.slice(1).forEach(row => {
            const section = row[sectionIndex];
            if (section) {
                sections.add(section); // Add section to the Set
            }
        });

        res.json([...sections]); // Convert Set to Array and send response

    } catch (error) {
        console.error("Error reading Excel file:", error.message);
        res.status(500).json({ message: 'Error reading Excel file', error: error.message });
    }
});





// 📌 Get all Batches from Sections
router.get('/getAllBatches/:section?', (req, res) => {
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'Excel file not found' });
    }

    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON format
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headerRow = jsonData[0]; // First row as column names
        
        // Get indexes of Section and Batches columns
        const sectionIndex = headerRow.indexOf('Section');
        const batchesIndex = headerRow.indexOf('Batches');

        if (sectionIndex === -1 || batchesIndex === -1) {
            return res.status(404).json({ message: 'Required columns not found in Excel' });
        }

        const sectionBatchMap = {};

        jsonData.slice(1).forEach(row => {
            const section = row[sectionIndex];
            const batches = row[batchesIndex];

            if (section && batches) {
                const batchList = [];
                const batchRanges = batches.split('-');

                if (batchRanges.length === 2) {
                    const startBatch = parseInt(batchRanges[0].replace("Batch_", "").trim());
                    const endBatch = parseInt(batchRanges[1].replace("Batch_", "").trim());
                    
                    // Generate the batch names for the range
                    for (let i = startBatch; i <= endBatch; i++) {
                        batchList.push(`Batch_${i}`);
                    }
                }

                sectionBatchMap[section] = batchList;
            }
        });

        res.json(sectionBatchMap);

    } catch (error) {
        console.error("Error reading Excel file:", error.message);
        res.status(500).json({ message: 'Error reading Excel file', error: error.message });
    }
});

module.exports = router;

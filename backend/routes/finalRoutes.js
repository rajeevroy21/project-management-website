const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const router = express.Router();
const storageDirectory = path.join(__dirname, '..', 'documents', 'domain_faculty');
const excelFilePath = path.join(storageDirectory, 'guide_info.xlsx');

// Ensure the directory exists
if (!fs.existsSync(storageDirectory)) {
    fs.mkdirSync(storageDirectory, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageDirectory);
    },
    filename: (req, file, cb) => {
        const filePath = path.join(storageDirectory, 'guide_info.xlsx');
        
        // Delete the existing file before saving a new one
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        cb(null, 'guide_info.xlsx'); // Always save as 'guide_info.xlsx'
    },
});

const upload = multer({ storage });

// Serve static files
router.use('/documents', express.static(storageDirectory));

// 📌 Upload a file
router.post('/uploadGuideInfo', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', fileName: req.file.filename });
});

// 📌 Retrieve Excel data as JSON
router.get('/getGuideInfo', (req, res) => {
    // Check if the file exists
    if (!fs.existsSync(excelFilePath)) {
        console.log(`File not found at path: ${excelFilePath}`);  // Debugging line
        return res.status(404).json({ message: 'File not found' });
    }
    
    // Read and parse the Excel file
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];  // Get the first sheet
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert the sheet data to JSON
    
    res.json({ data: sheetData });
});

router.get('/faculty/batch/:batchNumber', (req, res) => {
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'Excel file not found' });
    }

    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON format
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Debug: Log the first row (header row)
        console.log("Extracted Headers:", jsonData[0]);

        if (!jsonData.length) {
            return res.status(404).json({ message: 'Excel file is empty' });
        }

        const batchNumber = req.params.batchNumber.trim();
        const headerRow = jsonData[0]; // First row as column names

        // 🔍 Ensure column names match exactly
        const batchIndex = headerRow.findIndex(col => col.trim().toLowerCase() === "batch number");
        const domainIndex = headerRow.findIndex(col => col.trim().toLowerCase() === "domain");
        const guideIndex = headerRow.findIndex(col => col.trim().toLowerCase() === "allocated guide");

        // Debug: Log indexes
        console.log("Batch Index:", batchIndex);
        console.log("Domain Index:", domainIndex);
        console.log("Guide Index:", guideIndex);

        if (batchIndex === -1 || domainIndex === -1 || guideIndex === -1) {
            return res.status(404).json({ message: 'Required columns not found in Excel', headers: headerRow });
        }

        // Search for the requested batch number
        const batchData = jsonData.slice(1).find(row => row[batchIndex] == batchNumber);

        if (!batchData) {
            return res.status(404).json({ message: 'No faculty found for this batch' });
        }

        // Prepare response
        const response = {
            batch: batchNumber,
            domain: batchData[domainIndex],
            allocatedGuide: batchData[guideIndex]
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error reading Excel file', error: error.message });
    }
});
// 📌 Get Allocated Guide by Batch Number
router.get('/faculty/batch/:batchNumber', (req, res) => {
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'Excel file not found' });
    }

    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON format
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const batchNumber = req.params.batchNumber.trim(); // Trim any extra spaces
        const headerRow = jsonData[0]; // First row as column names

        // Get column indexes
        const batchIndex = headerRow.indexOf('Batch Number');
        const guideIndex = headerRow.indexOf('Allocated Guide');

        if (batchIndex === -1 || guideIndex === -1) {
            return res.status(404).json({ message: 'Required columns not found in Excel' });
        }

        // Find the row with the requested batch number
        const guideNames = jsonData
            .slice(1) // Skip header row
            .filter(row => row[batchIndex] && row[batchIndex].toString().trim() === batchNumber)
            .map(row => row[guideIndex])
            .filter(name => name); // Remove empty names

        if (guideNames.length === 0) {
            return res.status(404).json({ message: 'No guide found for this batch number' });
        }

        res.json({ batchNumber, guideNames });
    } catch (error) {
        console.error("Error reading Excel file:", error.message);
        res.status(500).json({ message: 'Error reading Excel file', error: error.message });
    }
});

// 📌 Get list of uploaded files
router.get('/guideFiles', (req, res) => {
    fs.readdir(storageDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving files' });
        }
        res.json({ files });
    });
});

// 📌 Download the uploaded file
router.get('/files/:fileName', (req, res) => {
    const filePath = path.join(storageDirectory, req.params.fileName);
    console.log(`Attempting to download file at: ${filePath}`);  // Debugging line

    if (fs.existsSync(filePath)) {
        res.download(filePath);  // Ensure downloading the .xlsx file as is
    } else {
        console.log(`File not found: ${filePath}`);  // Debugging line
        res.status(404).json({ message: 'File not found' });
    }
});

// 📌 Delete a file
router.delete('/guideFiles/:fileName', (req, res) => {
    const filePath = path.join(storageDirectory, req.params.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);  // Delete the file
        res.json({ message: 'File deleted successfully' });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

module.exports = router;

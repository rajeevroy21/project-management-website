const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const router = express.Router();
const documentsDirectory = path.join(__dirname, '..', 'documents', 'domain_faculty');
const excelFilePath = path.join(documentsDirectory, 'faculty_data.xlsx'); // Update this to your actual file

// Ensure directory exists
if (!fs.existsSync(documentsDirectory)) {
    fs.mkdirSync(documentsDirectory, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, documentsDirectory);
    },
    filename: (req, file, cb) => {
        const filePath = path.join(documentsDirectory, 'faculty_data.xlsx');

        // Delete existing file before saving a new one
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        cb(null, 'faculty_data.xlsx'); // Always save as 'faculty_data.xlsx'
    },
});

const upload = multer({ storage });

// Serve static files
router.use('/documents', express.static(documentsDirectory));

// 📌 Upload a file
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', fileName: req.file.filename });
});

// 📌 Get list of uploaded files
router.get('/files', (req, res) => {
    fs.readdir(documentsDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving files' });
        }
        res.json({ files });
    });
});

// 📌 Download a file
router.get('/files/:fileName', (req, res) => {
    const filePath = path.join(documentsDirectory, req.params.fileName);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// 📌 Delete a file
router.delete('/files/:fileName', (req, res) => {
    const filePath = path.join(documentsDirectory, req.params.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});
router.get('/domains', (req, res) => {
    fs.readdir(documentsDirectory, (err, files) => {
        if (err || !files.length) {
            return res.status(404).json({ message: 'No Excel file found' });
        }

        // Find the latest uploaded Excel file
        const latestFile = files
            .filter(file => file.endsWith('.xlsx'))
            .sort((a, b) => fs.statSync(path.join(documentsDirectory, b)).mtime - fs.statSync(path.join(documentsDirectory, a)).mtime)[0];

        if (!latestFile) {
            return res.status(404).json({ message: 'No valid Excel file found' });
        }

        try {
            const excelFilePath = path.join(documentsDirectory, latestFile);
            const workbook = xlsx.readFile(excelFilePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            if (!jsonData.length) {
                return res.status(404).json({ message: 'Excel file is empty' });
            }

            const columnNames = jsonData[0]; // First row as column names
            res.json({ domains: columnNames });
        } catch (error) {
            res.status(500).json({ message: 'Error reading Excel file', error: error.message });
        }
    });
});

router.get('/faculty/:domain', (req, res) => {
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'Excel file not found' });
    }

    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON format
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const domain = req.params.domain.trim(); // Trim any extra spaces
        const headerRow = jsonData[0]; // First row as column names
        
        console.log("Header Row:", headerRow);
        console.log("Requested Domain:", domain);

        const columnIndex = headerRow.indexOf(domain);

        console.log("Column Index:", columnIndex);

        if (columnIndex === -1) {
            return res.status(404).json({ message: 'Domain not found in Excel' });
        }

        // Extract faculty names under the selected domain
        const facultyNames = jsonData.slice(1).map(row => row[columnIndex]).filter(name => name);

        console.log("Extracted Faculty Names:", facultyNames);

        res.json({ domain, facultyNames });
    } catch (error) {
        res.status(500).json({ message: 'Error reading Excel file', error: error.message });
    }
});



module.exports = router;

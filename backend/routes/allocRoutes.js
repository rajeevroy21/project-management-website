const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const router = express.Router();
const storageDirectory = path.join(__dirname, '..', 'documents', 'domain_faculty');
const excelFilePath = path.join(storageDirectory, 'student_info.xlsx');

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
        const filePath = path.join(storageDirectory, 'student_info.xlsx');
        
        // Delete the existing file before saving a new one
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        cb(null, 'student_info.xlsx'); // Always save as 'student_info.xlsx'
    },
});

const upload = multer({ storage });

// Serve static files
router.use('/documents', express.static(storageDirectory));

// 📌 Upload a file
router.post('/uploadStudentInfo', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', fileName: req.file.filename });
});

// 📌 Retrieve Excel data as JSON
router.get('/getStudentInfo', (req, res) => {
    // Check if the file exists
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'File not found' });
    }
    
    // Read and parse the Excel file
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];  // Get the first sheet
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert the sheet data to JSON
    
    res.json({ data: sheetData });
});
// 📌 Get students grouped by batch
router.get('/getBatches', (req, res) => {
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);


    const batches = {};

    sheetData.forEach((student) => {
        const batchNumber = student["Batch Number"]; // Ensure correct key
        const batchTitle = student["Batch Title"];

        if (!batchNumber) {
            console.error("Missing Batch Number for student:", student);
            return; // Skip students without Batch Number
        }

        if (!batches[batchNumber]) {
            batches[batchNumber] = {
                title: batchTitle,
                students: [],
            };
        }

        batches[batchNumber].students.push(student.Regdno);
    });

    res.json({ batches });
});
router.get('/downloadStudentInfo', (req, res) => {
    // Check if the file exists
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Read and parse the Excel file
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Format data as required
    const formattedData = sheetData.map(student => ({
        Regdno: student.Regdno,
        Section: student.Section,
        'Batch Title': student.Domain, // Assuming Domain is the Batch Title
        'Batch Number': student.BatchNumber,
        Status: student.Status
    }));

    // Create a new workbook with formatted data
    const newWorkbook = xlsx.utils.book_new();
    const newWorksheet = xlsx.utils.json_to_sheet(formattedData);
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Formatted Student Info');

    // Temporary file path
    const tempFilePath = path.join(storageDirectory, 'formatted_student_info.xlsx');
    xlsx.writeFile(newWorkbook, tempFilePath);

    // Download the newly formatted Excel file
    res.download(tempFilePath, 'student_info.xlsx', (err) => {
        if (err) {
            console.error('Error downloading file:', err);
        }
        // Optionally delete the temporary file after download
        fs.unlinkSync(tempFilePath);
    });
});



// 📌 Post new student data (Add a record)
router.post('/addStudent', (req, res) => {
    const { Regdno, Section, Domain, BatchNumber, Status } = req.body;

    if (!Regdno || !Section || !Domain || !BatchNumber || !Status) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the file exists, if not, create a new one with headers
    if (!fs.existsSync(excelFilePath)) {
        const newData = [
            { Regdno, Section, Domain, BatchNumber, Status }
        ];
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(newData);
        xlsx.utils.book_append_sheet(wb, ws, 'Student Info');
        xlsx.writeFile(wb, excelFilePath);
        return res.status(200).json({ message: 'Student data added successfully' });
    }

    // If file exists, update it with the new student data
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    data.push({ Regdno, Section, Domain, BatchNumber, Status });

    const updatedSheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = updatedSheet;
    xlsx.writeFile(workbook, excelFilePath);

    res.status(200).json({ message: 'Student data added successfully' });
});

// 📌 Get list of uploaded files
router.get('/studentFiles', (req, res) => {
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

    if (fs.existsSync(filePath)) {
        res.download(filePath);  // Ensure downloading the .xlsx file as is
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// 📌 Delete a file
router.delete('/studentFiles/:fileName', (req, res) => {
    const filePath = path.join(storageDirectory, req.params.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);  // Delete the file
        res.json({ message: 'File deleted successfully' });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

module.exports = router;

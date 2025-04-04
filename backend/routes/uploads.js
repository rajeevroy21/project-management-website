const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); // Ensure this import is at the top of your file

// Initialize Router
const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const datePrefix = Date.now(); // Get the current timestamp
    cb(null, `${file.originalname.replace(path.extname(file.originalname), '')}-${datePrefix}${path.extname(file.originalname)}`);
},
 
});

// Multer setup with file filter for .xlsx files
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    if (fileExtension === '.xlsx') {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed!'), false);
    }
  },
});

// File upload route
router.post('/', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({
      message: 'File uploaded successfully!',
      filename: req.file.filename,
      filepath: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
});
router.delete('/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
  
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ message: 'File not found' });
      }
  
      // File exists, proceed to delete
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error deleting the file' });
        }
        res.status(200).json({ message: 'File deleted successfully' });
      });
    });
  });
  
// Route to get all uploaded files
router.get('/files', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading the uploads directory' });
    }

    const uploadedFiles = files.filter(file => fs.statSync(path.join(uploadsDir, file)).isFile());
    res.status(200).json(uploadedFiles);
  });
});
// Route to download a file
router.get('/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
  
    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error downloading the file' });
        }
      });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });
  
// Read and parse the latest uploaded Excel file
router.get('/getfiles', async (req, res) => {
  try {
      // ✅ Ensure the uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
          return res.status(404).json({ message: 'Uploads directory does not exist' });
      }

      // ✅ Get all uploaded .xlsx files
      const files = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.xlsx'));
      if (files.length === 0) {
          return res.status(404).json({ message: 'No Excel file found' });
      }

      // ✅ Get the most recent file
      const latestFile = files[files.length - 1];
      const filePath = path.join(uploadsDir, latestFile); // Updated to use uploadsDir instead of uploadPath

      console.log('File path:', filePath); // Debugging log to check the file path

      // ✅ Read Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // First sheet
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      console.log('Excel data:', jsonData); // Debugging log to check the extracted data

      res.json(jsonData); // ✅ Send student data to frontend
  } catch (error) {
      console.error('Error reading Excel file:', error.message); // Log specific error message
      res.status(500).json({ message: 'Failed to read Excel file', error: error.message });
  }
});
  
// Serve static files for uploads
router.use('/uploads', express.static(uploadsDir));

module.exports = router;

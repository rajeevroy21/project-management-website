const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Faculty = require('../models/Faculty');

const router = express.Router();

// First set up session middleware
router.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 60 * 60, // 1 hour
        crypto: { secret: process.env.CRYPTO_SECRET || 'encryptionsecretkey' }
    }),
   cookie: {
  secure: true, // must be true for production with HTTPS
  httpOnly: true,
  sameSite: 'none', // allow cross-site cookie sharing
  maxAge: 60 * 60 * 1000
},
    name: 'projectPortal.sid'
}));

// Add debugging middleware
router.use((req, res, next) => {
    console.log("Route accessed:", req.originalUrl);
    console.log("Session Data:", req.session);
    console.log("Cookies:", req.cookies);
    next();
});

// Define authentication middleware
const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.authenticated) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        if (req.session.token) {
            req.user = jwt.verify(req.session.token, process.env.JWT_SECRET || 'fallbacksecret');
        }
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        req.session.destroy((err) => {
            return res.status(403).json({ message: 'Invalid session. Please log in again.' });
        });
    }
};

// IMPORTANT: Define all specific routes before parameterized routes

// Auth check route
router.get('/auth-check', (req, res) => {
    try {
        if (req.session && req.session.authenticated) {
            return res.json({ isAuthenticated: true });
        }
        res.json({ isAuthenticated: false });
    } catch (error) {
        console.error("Auth check error:", error);
        res.status(500).json({ message: "Error checking authentication status" });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { facultyId, password } = req.body;

        // Check if faculty exists
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) return res.status(400).json({ message: 'Invalid credentials' });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const payload = { facultyId: faculty.facultyId, role: faculty.role, id: faculty._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallbacksecret', { expiresIn: '1h' });

        // Store in session
        req.session.authenticated = true;
        req.session.role = faculty.role;
        req.session.token = token;

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ message: 'Session creation failed' });
            }
            
            res.status(200).json({ 
                message: 'Login successful',
                name: faculty.name
            });
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
});

// User info route
router.get('/user', isAuthenticated, (req, res) => {
    if (!req.session) {
        return res.status(401).json({ message: 'No active session' });
    }
    
    res.json({ 
        userId: req.session.registrationNumber,
        authenticated: req.session.authenticated,
        role: req.session.userType,
    });
});

// User role route
router.get('/user-role', isAuthenticated, (req, res) => {
    if (!req.session || !req.session.role) {
        return res.status(401).json({ message: 'No role information available' });
    }
    
    res.json({ role: req.session.role });
});

// Logout route
router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.status(200).json({ message: 'Already logged out' });
    }
    
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.clearCookie('projectPortal.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Get all faculties
router.get('/', async (req, res) => {
    try {
        const faculties = await Faculty.find().select('-password');
        res.json(faculties);
    } catch (error) {
        console.error("Get faculties error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Create new faculty
router.post('/', async (req, res) => {
    try {
        const { facultyId, password, role } = req.body;

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ facultyId });
        if (existingFaculty) {
            return res.status(400).json({ message: 'Faculty ID already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new faculty
        const newFaculty = new Faculty({
            facultyId,
            password: hashedPassword,
            role: role
        });

        // Save faculty to database
        const savedFaculty = await newFaculty.save();

        // Return success without password
        res.status(201).json({
            message: 'Faculty registered successfully',
            faculty: {
                id: savedFaculty._id,
                facultyId: savedFaculty.facultyId,
                role: savedFaculty.role
            }
        });
    } catch (error) {
        console.error('Faculty registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Debug route (development only)
if (process.env.NODE_ENV !== 'production') {
    router.get('/debug-session', (req, res) => {
        res.json({
            sessionID: req.sessionID,
            sessionExists: !!req.session,
            sessionData: req.session || 'No session'
        });
    });
}

// THIS MUST BE THE LAST ROUTE - Get faculty by ID
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id).select('-password');
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        console.error("Get faculty by ID error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

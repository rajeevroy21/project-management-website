const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
// 📌 Save or Update Attendance (Without Batch Number)
router.post("/mark", async (req, res) => {
    console.log("📥 Received Request Body:", req.body);

    const { date, attendance } = req.body;

    if (!date || !attendance || Object.keys(attendance).length === 0) {
        console.error("❌ Missing fields:", { date, attendance });
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let existingRecord = await Attendance.findOne({ date });

        if (existingRecord) {
            existingRecord.attendance = { ...existingRecord.attendance, ...attendance };
            await existingRecord.save();
        } else {
            const newAttendance = new Attendance({ date, attendance });
            await newAttendance.save();
        }

        console.log("✅ Attendance Saved Successfully!");
        res.json({ success: true, message: "Attendance saved successfully!" }); // ✅ Add success: true
    } catch (error) {
        console.error("❌ Error in Attendance API:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 📌 Get Attendance for a Specific Date
router.get("/get/:date", async (req, res) => {
    const { date } = req.params;

    try {
        const record = await Attendance.findOne({ date });

        if (record) {
            res.json({ attendance: record.attendance });
        } else {
            res.json({ attendance: {} });
        }
    } catch (error) {
        res.status(500).json({ error: "Error fetching attendance" });
    }
});
router.get("/submissions/download/excel", async (req, res) => {
    try {
        const records = await Attendance.find({});

        const submissions = [];
        const regdNosSet = new Set();
        const existingRecords = new Map();

        // ✅ Extract all regd nos and dates from MongoDB
        records.forEach(record => {
            Object.keys(record.attendance).forEach(studentId => {
                if (typeof studentId === "string" && !studentId.includes("[object Object]")) {
                    regdNosSet.add(studentId);  // Add to the set (unique regd nos)
                    existingRecords.set(studentId, record.date || "-");
                }
            });
        });

        // ✅ Convert the Set to an array of unique regd nos
        const allRegdNos = Array.from(regdNosSet);

        // ✅ Generate submissions with dates or `-` for missing ones
        allRegdNos.forEach(regdNo => {
            submissions.push({
                RegdnO: regdNo,
                Date: existingRecords.get(regdNo) || "-"  // Assign date or "-"
            });
        });

        // ✅ Create Excel file
        const worksheet = xlsx.utils.json_to_sheet(submissions);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Submissions");

        // ✅ Save Excel file
        const filePath = path.join(__dirname, "submissions.xlsx");
        xlsx.writeFile(workbook, filePath);

        // ✅ Send the Excel file to the user
        res.download(filePath, "submissions.xlsx", (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
                res.status(500).json({ error: "Error downloading file" });
            } else {
                // Optional: Delete the file after download
                setTimeout(() => fs.unlinkSync(filePath), 5000);
            }
        });

    } catch (error) {
        console.error("❌ Error generating Excel file:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
// 📌 Get All Students and All Dates (Without Downloading)
router.get("/all-students-and-dates", async (req, res) => {
    try {
        const records = await Attendance.find({});

        const allStudents = new Set();
        const allDates = new Set();

        records.forEach(record => {
            // Add all registration numbers (student IDs)
            Object.keys(record.attendance).forEach(studentId => {
                if (typeof studentId === "string" && !studentId.includes("[object Object]")) {
                    allStudents.add(studentId);
                }
            });

            // Add unique dates
            if (record.date) {
                allDates.add(record.date);
            }
        });

        res.json({
            students: Array.from(allStudents),  // Convert Set to Array
            dates: Array.from(allDates)         // Convert Set to Array
        });

    } catch (error) {
        console.error("❌ Error fetching students and dates:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
// 📌 Get First Attendance Date for a Specific Student
router.get("/student/first/:regdNo", async (req, res) => {
    const { regdNo } = req.params;

    try {
        const records = await Attendance.find({}).sort({ date: 1 });  // Sort by date (chronological order)

        let firstAttendanceDate = "-";

        for (const record of records) {
            if (record.attendance[regdNo]) {
                firstAttendanceDate = record.date;
                break;  // Stop once the first date is found
            }
        }

        res.json({
            student: regdNo,
            firstAttendance: firstAttendanceDate
        });

    } catch (error) {
        console.error("❌ Error fetching first attendance date:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
});

// 📌 Delete All Attendance Records
router.delete("/delete-all", async (req, res) => {
    try {
        await Attendance.deleteMany({});  // Removes all documents in the collection
        console.log("✅ All attendance records deleted successfully!");
        res.json({ success: true, message: "All attendance records have been deleted." });
    } catch (error) {
        console.error("❌ Error deleting attendance records:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;

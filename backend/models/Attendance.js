const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true },
    attendance: { type: Object, required: true } // { "studentRegdNo": true/false }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;

import React, { useEffect, useState } from 'react';
import { X, Users, Award, ChevronRight, PieChart, ShieldAlert, Search, CheckCircle, Clock, BarChart, Download } from 'lucide-react';
import Image from '../../Images/6763395.webp';
import Cookies from 'js-cookie';
import axios from 'axios';
function App() {
  const [batches, setBatches] = useState({});
  const [guides, setGuides] = useState({});
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [reviews, setReviews] = useState({});
  const [userRole, setUserRole] = useState("coordinator");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("sec-A");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBatches, setFilteredBatches] = useState({});
  const [batchSectionMap, setBatchSectionMap] = useState({});
  const [currentReview, setCurrentReview] = useState(1);
  const [attendanceData, setAttendanceData] = useState({});
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const evaluationParameters = [
    { id: 1, name: "Identify engineering problem" },
    { id: 2, name: "Formulate complex engineering problem" },
    { id: 3, name: "Solve complex engineering problem" },
    { id: 4, name: "Apply engineering design to produce solutions (safety)" },
    { id: 5, name: "Apply engineering design to produce solutions (auxiliary)" },
    { id: 6, name: "Apply engineering design to produce solutions (Global)" },
    { id: 7, name: "Apply engineering design to produce solutions (economic)" },
    { id: 8, name: "Communicate effectively" },
    { id: 9, name: "Recognize ethical and professional responsibilities" },
    { id: 10, name: "Function effectively on a team (goals)" },
    { id: 11, name: "Function effectively on a team (plan tasks)" },
    { id: 12, name: "Function effectively on a team (meet objectives)" },
    { id: 13, name: "Develop and conduct appropriate experimentation (data interpretation)" },
    { id: 14, name: "Conduct appropriate experimentation (conclusions)" },
    { id: 15, name: "Acquire and apply new knowledge" }
  ];

  const projectSpecificParameters = [
    { id: 1, name: "Identification of tools/equipment/training needs etc" },
    { id: 2, name: "Understanding by individual students on the overall aspect of the project" },
    { id: 3, name: "Completion of literature survey" },
    { id: 4, name: "Design of project set up and Implementation" },
    { id: 5, name: "Presentation Skills" }
  ];

  const handleResetAttendance = async () => {
    if (window.confirm('Are you sure you want to reset all attendance data? This action cannot be undone.')) {
      try {
        const response = await fetch('https://project-management-website-dovj.onrender.com/api/attendance/delete-all', {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to reset attendance');
        }

        const data = await response.json();
        alert('✅ Attendance reset successfully!');
        
        setAttendanceData({});
      } catch (error) {
        console.error('Error resetting attendance:', error);
        alert('❌ Failed to reset attendance: ' + error.message);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const savedReviews = localStorage.getItem('batchReviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }

      const roleResponse = await axios.get(
        'https://project-management-website-dovj.onrender.com/api/faculties/user-role',
        { withCredentials: true }
      );
      setUserRole(roleResponse.data.role);

      const batchesResponse = await fetch("https://project-management-website-dovj.onrender.com/api/alloc/getBatches");
      if (!batchesResponse.ok) {
        throw new Error('Failed to fetch batches');
      }
      const batchesData = await batchesResponse.json();
      
      if (!batchesData || !batchesData.batches) {
        setBatches({});
        setFilteredBatches({});
      } else {
        setBatches(batchesData.batches);
        setFilteredBatches(batchesData.batches);
        await fetchGuides(batchesData.batches);
      }

      try {
        const sectionsResponse = await fetch("https://project-management-website-dovj.onrender.com/api/section/getSections");
        if (!sectionsResponse.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionData = await sectionsResponse.json();
        setSections(sectionData || []);
        if (batchesData.batches && sectionData) {
          distributeBatchesToSections(batchesData.batches, sectionData);
        }
      } catch (sectionError) {
        console.error("Error fetching sections:", sectionError);
        setSections([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      setBatches({});
      setFilteredBatches({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendanceClick = async () => {
    setIsAttendanceModalOpen(true);
    try {
      const studentsResponse = await fetch("https://project-management-website-dovj.onrender.com/api/students");
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }
      const studentsData = await studentsResponse.json();
      
      const initialAttendance = {};
      Object.values(studentsData || {}).forEach(student => {
        initialAttendance[student] = { present: false };
      });
      setAttendanceData(initialAttendance);

      const attendanceResponse = await fetch(`https://project-management-website-dovj.onrender.com/api/attendance/get/${selectedDate}`);
      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance');
      }
      const attendanceData = await attendanceResponse.json();
      
      if (attendanceData?.attendance) {
        setAttendanceData(prev => ({
          ...prev,
          ...Object.entries(attendanceData.attendance).reduce((acc, [student, present]) => ({
            ...acc,
            [student]: { present }
          }), {})
        }));
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError(error.message);
    }
  };

  const downloadAttendance = async () => {
    try {
      const studentsResponse = await fetch("https://project-management-website-dovj.onrender.com/api/students");
      if (!studentsResponse.ok) {
        throw new Error("Failed to fetch students");
      }
  
      const studentsData = await studentsResponse.json();
  
      const students = studentsData.map(student => student.registrationNumber);
  
      if (students.length === 0) {
        alert("No students found!");
        return;
      }
  
      const csvRows = [["Registration Number", "First Attendance Date"]];
  
      for (const regdNo of students) {
        try {
          const attendanceResponse = await fetch(`https://project-management-website-dovj.onrender.com/api/attendance/student/first/${regdNo}`);
          
          if (!attendanceResponse.ok) {
            throw new Error(`Failed to fetch attendance for ${regdNo}`);
          }
  
          const attendanceResult = await attendanceResponse.json();
          const firstAttendance = attendanceResult?.firstAttendance || "-";
  
          csvRows.push([regdNo, firstAttendance]);
  
        } catch (error) {
          console.error(`Error fetching attendance for ${regdNo}:`, error);
          csvRows.push([regdNo, "-"]);
        }
      }
  
      const csvContent = csvRows.map(row => row.join(",")).join("\n");
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading attendance:", error);
      alert("Failed to download attendance");
    }
  };
  
  const fetchAttendance = async (date) => {
    try {
      const response = await fetch(`https://project-management-website-dovj.onrender.com/api/attendance/get/${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }
      const data = await response.json();
      
      if (data?.attendance) {
        setAttendanceData(prev => ({
          ...prev,
          ...Object.entries(data.attendance).reduce((acc, [student, present]) => ({
            ...acc,
            [student]: { present }
          }), {})
        }));
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (isAttendanceModalOpen) {
      fetchAttendance(selectedDate);
    }
  }, [selectedDate, isAttendanceModalOpen]);

  const handleAttendanceSubmit = async () => {
    try {
      const formattedAttendance = {};
      Object.entries(attendanceData).forEach(([key, value]) => {
        if (value && value.present !== undefined) {
          formattedAttendance[key] = value.present;
        }
      });

      const response = await fetch("https://project-management-website-dovj.onrender.com/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          attendance: formattedAttendance
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      const data = await response.json();
      if (data.message === "Attendance saved successfully!") {
        alert("✅ Attendance marked successfully!");
        await fetchAttendance(selectedDate);
      } else {
        throw new Error(data.error || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("❌ Error marking attendance:", error);
      alert(`Error marking attendance: ${error.message}`);
    }
  };

  const distributeBatchesToSections = (batchesData, sectionsData) => {
    if (!batchesData || Object.keys(batchesData).length === 0 || !sectionsData || sectionsData.length === 0) {
      setBatchSectionMap({});
      return;
    }

    try {
      const batchNumbers = Object.keys(batchesData);
      const numSections = sectionsData.length;
      const batchesPerSection = Math.ceil(batchNumbers.length / numSections);
      
      const sectionMap = {};
      
      sectionsData.forEach((section, index) => {
        const startIdx = index * batchesPerSection;
        const endIdx = Math.min(startIdx + batchesPerSection, batchNumbers.length);
        const sectionBatches = batchNumbers.slice(startIdx, endIdx);
        
        sectionBatches.forEach(batchNumber => {
          sectionMap[batchNumber] = section;
        });
      });
      
      setBatchSectionMap(sectionMap);
      filterBatchesBySection(batchesData, sectionMap, selectedSection, searchQuery);
    } catch (error) {
      console.error("Error distributing batches:", error);
      setBatchSectionMap({});
    }
  };

  const filterBatchesBySection = (allBatches, sectionMap, section, query) => {
    try {
      if (!allBatches || Object.keys(allBatches).length === 0) {
        setFilteredBatches({});
        return;
      }

      const sectionFiltered = Object.entries(allBatches).reduce((acc, [batchNumber, batchData]) => {
        if (sectionMap[batchNumber] === section) {
          acc[batchNumber] = batchData;
        }
        return acc;
      }, {});

      if (query.trim() === "") {
        setFilteredBatches(sectionFiltered);
      } else {
        const searchFiltered = Object.entries(sectionFiltered).reduce((acc, [batchNumber, batchData]) => {
          if (
            batchNumber.toLowerCase().includes(query.toLowerCase()) ||
            (batchData.students && batchData.students.some(student => 
              student.toLowerCase().includes(query.toLowerCase())
            ))
          ) {
            acc[batchNumber] = batchData;
          }
          return acc;
        }, {});
        setFilteredBatches(searchFiltered);
      }
    } catch (error) {
      console.error("Error filtering batches:", error);
      setFilteredBatches({});
    }
  };

  useEffect(() => {
    filterBatchesBySection(batches, batchSectionMap, selectedSection, searchQuery);
  }, [selectedSection, searchQuery, batches, batchSectionMap]);

  const fetchGuides = async (batchesData) => {
    if (!batchesData || Object.keys(batchesData).length === 0) {
      setGuides({ error: "Not Assigned" });
      return;
    }

    try {
      const guidePromises = Object.keys(batchesData)
        .filter(batchNumber => batchNumber && batchNumber !== "-")
        .map(async batchNumber => {
          try {
            const response = await fetch(`https://project-management-website-dovj.onrender.com/api/final/faculty/batch/${batchNumber}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch guide for batch ${batchNumber}`);
            }
            const data = await response.json();
            return { batchNumber, allocatedGuide: data.allocatedGuide || "Not Assigned" };
          } catch (error) {
            console.error(`Error fetching guide for batch ${batchNumber}:`, error);
            return { batchNumber, allocatedGuide: "Error Fetching Guide" };
          }
        });

      const results = await Promise.all(guidePromises);
      const guideData = {};
      results.forEach(({ batchNumber, allocatedGuide }) => {
        guideData[batchNumber] = allocatedGuide;
      });
      setGuides(guideData);
    } catch (error) {
      console.error("Error fetching guides:", error);
      setGuides({ error: "Error Fetching Guides" });
    }
  };

  const handleReviewClick = (batchNumber) => {
    setSelectedBatch(batchNumber);
    setIsModalOpen(true);
    fetchReviews(batchNumber);
  };

  const handlePerformanceClick = (batchNumber) => {
    setSelectedBatch(batchNumber);
    setIsPerformanceModalOpen(true);
    fetchReviews(batchNumber);
  };

  const fetchReviews = async (batchNumber) => {
    try {
      const response = await fetch(`https://project-management-website-dovj.onrender.com/api/review/reviews/${batchNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      
      if (data.reviews) {
        setReviews(prevState => ({
          ...prevState,
          [batchNumber]: data.reviews
        }));
        localStorage.setItem('batchReviews', JSON.stringify({
          ...reviews,
          [batchNumber]: data.reviews
        }));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(error.message);
    }
  };

  const handleReviewChange = (paramKey, value, studentRegd, reviewNumber) => {
    if (userRole !== "Faculty") return;
  
    let score = parseInt(value);
    if (isNaN(score) || score < 0 || score > 4) {
      alert("Score must be between 0 and 4");
      return;
    }
  
    setReviews(prevReviews => {
      const updatedReviews = { ...prevReviews };
      if (!updatedReviews[selectedBatch]) {
        updatedReviews[selectedBatch] = {};
      }
      if (!updatedReviews[selectedBatch][studentRegd]) {
        updatedReviews[selectedBatch][studentRegd] = {};
      }
      updatedReviews[selectedBatch][studentRegd][`${paramKey}_review_${reviewNumber}`] = score;
  
      localStorage.setItem('batchReviews', JSON.stringify(updatedReviews));
      return updatedReviews;
    });
  };

  const handleSubmit = async () => {
    if (userRole !== "Faculty") {
      alert("Only faculty members can submit reviews");
      return;
    }

    if (!selectedBatch) {
      alert("No batch selected for review submission");
      return;
    }

    const reviewData = reviews[selectedBatch];
    if (!reviewData || Object.keys(reviewData).length === 0) {
      alert("No review data to submit");
      return;
    }

    try {
      const response = await fetch("https://project-management-website-dovj.onrender.com/api/review/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchNumber: selectedBatch,
          reviews: reviews[selectedBatch]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit reviews');
      }

      const data = await response.json();
      if (data.message === "Reviews saved successfully!") {
        alert("Review Submitted Successfully");
        await fetchReviews(selectedBatch);
      } else {
        throw new Error(data.error || "Failed to submit reviews");
      }
    } catch (error) {
      console.error("❌ Error submitting reviews:", error);
      alert(`Error submitting review: ${error.message}`);
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsPerformanceModalOpen(false);
    setIsAttendanceModalOpen(false);
    setError(null);
  };

  const calculateSummativeReview = (batchNumber, studentRegd) => {
    try {
      if (!reviews[batchNumber] || !reviews[batchNumber][studentRegd]) return 0;
      
      let totalMarks = 0;
      let validReviews = 0;

      evaluationParameters.forEach(param => {
        for (let review = 1; review <= 4; review++) {
          const score = reviews[batchNumber][studentRegd][`param_${param.id}_review_${review}`];
          if (score !== undefined && !isNaN(parseInt(score))) {
            totalMarks += parseInt(score);
            validReviews++;
          }
        }
      });

      projectSpecificParameters.forEach(param => {
        for (let review = 1; review <= 4; review++) {
          const score = reviews[batchNumber][studentRegd][`specific_${param.id}_review_${review}`];
          if (score !== undefined && !isNaN(parseInt(score))) {
            totalMarks += parseInt(score);
            validReviews++;
          }
        }
      });

      return validReviews > 0 ? Math.round(totalMarks / validReviews) : 0;
    } catch (error) {
      console.error("Error calculating summative review:", error);
      return 0;
    }
  };

  const calculateReviewTotal = (batchNumber, studentRegd, reviewNumber) => {
    try {
      if (!reviews[batchNumber] || !reviews[batchNumber][studentRegd]) return 0;
      let totalMarks = 0;
      
      evaluationParameters.forEach(param => {
        const score = reviews[batchNumber][studentRegd][`param_${param.id}_review_${reviewNumber}`];
        if (score !== undefined && !isNaN(parseInt(score))) {
          totalMarks += parseInt(score);
        }
      });

      projectSpecificParameters.forEach(param => {
        const score = reviews[batchNumber][studentRegd][`specific_${param.id}_review_${reviewNumber}`];
        if (score !== undefined && !isNaN(parseInt(score))) {
          totalMarks += parseInt(score);
        }
      });
      
      return totalMarks;
    } catch (error) {
      console.error("Error calculating review total:", error);
      return 0;
    }
  };

  const calculateTotalScores = (batchNumber, studentRegd) => {
    try {
      let totalMarks = 0;
      for (let i = 1; i <= 4; i++) {
        totalMarks += calculateReviewTotal(batchNumber, studentRegd, i);
      }
      return totalMarks;
    } catch (error) {
      console.error("Error calculating total scores:", error);
      return 0;
    }
  };

  const handleKeyPress = (e, currentRow, currentCol, maxCols) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = document.querySelectorAll('input[type="number"]');
      const currentIndex = Array.from(inputs).indexOf(e.target);
      const nextRowIndex = currentIndex + maxCols - currentCol;
      
      if (nextRowIndex < inputs.length) {
        inputs[nextRowIndex].focus();
      }
    }
  };

  const downloadAllReviewsCSV = () => {
    try {
      const headers = [
        'Section',
        'Batch Number',
        'Registration Number',
        'Review 1',
        'Review 2',
        'Review 3',
        'Review 4',
        'Summative Review',
        'Total Score'
      ];

      const csvData = [];
      
      Object.entries(batches || {}).forEach(([batchNumber, batch]) => {
        if (batchNumber && batchNumber !== "-" && batch?.students) {
          const section = batchSectionMap[batchNumber] || 'Unassigned';
          
          batch.students.forEach(studentRegd => {
            const row = [
              section,
              batchNumber,
              studentRegd,
              calculateReviewTotal(batchNumber, studentRegd, 1),
              calculateReviewTotal(batchNumber, studentRegd, 2),
              calculateReviewTotal(batchNumber, studentRegd, 3),
              calculateReviewTotal(batchNumber, studentRegd, 4),
              calculateSummativeReview(batchNumber, studentRegd),
              calculateTotalScores(batchNumber, studentRegd)
            ];
            csvData.push(row);
          });
        }
      });

      csvData.sort((a, b) => {
        if (a[0] === b[0]) {
          return a[1].localeCompare(b[1]);
        }
        return a[0].localeCompare(b[0]);
      });

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `all_batch_reviews_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading reviews:", error);
      alert("Failed to download reviews");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",   
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",           
        textAlign: "center"        
      }}>
        <img 
          src={Image} 
          alt="Error" 
          style={{ width: "320px", marginBottom: "20px" }} 
        />
        <p style={{ 
          fontSize: "24px", 
          color: "#FF4C4C",        
          fontWeight: "bold",
          margin: "0"
        }}>
          Oops! Something went wrong.
        </p>
        <p style={{ 
          fontSize: "16px", 
          color: "#555",           
          marginTop: "10px" 
        }}>
          We're unable to process your request at the moment. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Attendance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#1E3A8A]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>
            <Clock className="text-[#D4A017]" size={24} />
          </div>
          <p className="text-gray-600 mb-4">Mark attendance for today's session</p>
          <div className="space-y-3">
            <button 
              onClick={handleAttendanceClick}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-2xl font-semibold shadow-md 
                hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 
                flex items-center justify-center"
            >
              <CheckCircle size={20} className="mr-2" />
              Take Attendance
            </button>
            <button 
              onClick={handleResetAttendance}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-2xl font-semibold shadow-md 
                hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-300 
                flex items-center justify-center"
            >
              <X size={20} className="mr-2" />
              Reset Attendance
            </button>
          </div>
        </div>

        {/* Project Evaluation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#1E3A8A]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Project Evaluation</h2>
            <Award className="text-purple-600" size={24} />
          </div>
          <p className="text-gray-600 mb-4">Review and grade student projects</p>
          <button 
            onClick={() => document.getElementById('batchSection')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-3 rounded-2xl font-semibold shadow-md 
              hover:from-[#162D6A] hover:to-[#1E3A8A] hover:shadow-lg transform hover:scale-105 transition-all duration-300 
              flex items-center justify-center"
          >
            <PieChart size={20} className="mr-2" />
            View Batches
          </button>
        </div>

        {/* Download Reviews Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#1E3A8A]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Download Reviews</h2>
            <Download className="text-[#1E3A8A] hover:text-[#3B82F6] transition-all duration-300" size={24} />
          </div>
          <p className="text-gray-600 mb-4">Download all reviews across sections</p>
          <button 
            onClick={downloadAllReviewsCSV}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-2xl font-semibold shadow-md 
              hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 
              flex items-center justify-center"
          >
            <Download size={20} className="mr-2" />
            Download All Reviews
          </button>
        </div>

        {/* Download Attendance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#1E3A8A]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Download Attendance</h2>
            <Download className="text-[#1E3A8A] hover:text-[#3B82F6] transition-all duration-300" size={24} />
          </div>
          <p className="text-gray-600 mb-4">Download Attendance across all sections</p>
          <button 
            onClick={downloadAttendance}
            className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-3 rounded-2xl font-semibold shadow-md 
              hover:from-[#162D6A] hover:to-[#1E3A8A] hover:shadow-lg transform hover:scale-105 transition-all duration-300 
              flex items-center justify-center"
          >
            <Download size={20} className="mr-2" />
            Download Attendance
          </button>
        </div>
      </div>

      {/* Batch Section */}
      <div id="batchSection" className="mt-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label htmlFor="section" className="block text-blue-900 text-lg font-bold mb-2">
              Select Section
            </label>
            <select
              id="section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="p-3 border border-blue-900 rounded-lg w-full bg-white shadow-sm 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            >
              {sections.map((section, index) => (
                <option key={index} value={section}>{section}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-2/3 relative">
            <label htmlFor="search" className="block text-blue-900 text-lg font-bold mb-2">Search Batches</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="Search by batch number or registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(filteredBatches)
            .filter(([batchNumber]) => batchNumber && batchNumber !== "-")
            .map(([batchNumber, batch]) => (
              <div key={batchNumber} className="bg-white shadow-xl rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{batchNumber}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {batch.students.length} Students
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Users size={20} className="mr-2" />
                      <span className="font-semibold">Registered Numbers:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {batch.students.map((regd, index) => (
                        <div key={index} className="bg-white rounded p-2 text-sm text-gray-700 shadow-sm">
                          {regd}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Award size={20} className="mr-2" />
                    <span className="font-semibold">Guide:</span>
                    <span className="ml-2 text-blue-600">
                      {guides[batchNumber] || "Loading..."}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={() => handleReviewClick(batchNumber)}
                    className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-3 rounded-2xl font-semibold shadow-md 
                      hover:from-[#162D6A] hover:to-[#1E3A8A] hover:shadow-lg transform hover:scale-105 transition-all duration-300 
                      flex items-center justify-center"
                  >
                    <Award size={20} className="mr-2" />
                    Review
                  </button>
                  <button 
                    onClick={() => handlePerformanceClick(batchNumber)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-2xl font-semibold shadow-md 
                      hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 
                      flex items-center justify-center"
                  >
                    <BarChart size={20} className="mr-2" />
                    Performance
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-7xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold text-gray-800 text-center">Project Evaluation Sheet</h3>
              <div className="mt-4">
                <p className="text-lg font-medium text-blue-900">
                  Title:<span className="ml-2 text-base font-medium text-gray-800">{filteredBatches[selectedBatch]?.title}</span>
                </p>

                <p className="text-lg font-medium text-blue-900">
                 <span className="ml-2 text-base font-medium text-gray-800">{selectedBatch}</span>
                </p>

                <p className="text-lg font-medium text-blue-900">
                  Sustainable Development Goal:<span className="ml-2 text-base font-medium text-gray-800">
                    {filteredBatches[selectedBatch]?.sdg || 'N/A'}
                  </span>
                </p>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-green-100 p-2 rounded">
                      <p className="font-semibold text-green-800">4-Excellent</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded">
                      <p className="font-semibold text-blue-800">3-Good</p>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded">
                      <p className="font-semibold text-yellow-800">2-Average</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded">
                      <p className="font-semibold text-red-800">1-Poor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <style>
                  {`
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                      -webkit-appearance: none;
                      margin: 0;
                    }
                    input[type="number"] {
                      -moz-appearance: textfield;
                    }
                  `}
                </style>

                {/* Evaluation Parameters Table */}
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr>
                      <th className="border px-2 py-2 w-12" rowSpan={2}>S.No.</th>
                      <th className="border px-2 py-2" rowSpan={2}>Evaluation Parameter</th>
                      {batches[selectedBatch]?.students?.map((regd) => (
                        <th key={regd} className="border px-2 py-2 text-center" colSpan={5}>{regd}</th>
                      ))}
                    </tr>
                    <tr>
                      {batches[selectedBatch]?.students?.flatMap((regd) => 
                        ["R1", "R2", "R3", "R4", "Summative Review"].map((review) => (
                          <th key={`${regd}-${review}`} className="border px-2 py-2 w-16 text-center">{review}</th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationParameters.map((param, rowIndex) => (
                      <tr key={param.id}>
                        <td className="border px-2 py-2 text-center">{param.id}</td>
                        <td className="border px-2 py-2">{param.name}</td>
                        {batches[selectedBatch]?.students?.flatMap((regd) => 
                          [1, 2, 3, 4, 5].map((review, colIndex) => (
                            <td key={`${regd}-${review}`} className="border px-1 py-1">
                              <input
                                type="number"
                                className={`w-full p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  userRole !== "Faculty" ? "bg-gray-100" : ""
                                }`}
                                min="0"
                                max="4"
                                readOnly={userRole !== "Faculty"}
                                value={reviews[selectedBatch]?.[regd]?.[`param_${param.id}_review_${review}`] || ''}
                                onChange={(e) => handleReviewChange(`param_${param.id}`, e.target.value, regd, review)}
                                onKeyPress={(e) => handleKeyPress(e, rowIndex, colIndex, 5)}
                              />
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Project Specific Parameters Table */}
                <div className="mt-8">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr>
                        <th className="border px-2 py-2 w-12" rowSpan={2}>S.No.</th>
                        <th className="border px-2 py-2" rowSpan={2}>Project Specific Parameters</th>
                        {batches[selectedBatch]?.students?.map((regd) => (
                          <th key={regd} className="border px-2 py-2 text-center" colSpan={5}>{regd}</th>
                        ))}
                      </tr>
                      <tr>
                        {batches[selectedBatch]?.students?.flatMap((regd) => 
                          ["R1", "R2", "R3", "R4", "Summative Review"].map((review) => (
                            <th key={`${regd}-${review}`} className="border px-2 py-2 w-16 text-center">{review}</th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {projectSpecificParameters.map((param, rowIndex) => (
                        <tr key={param.id}>
                          <td className="border px-2 py-2 text-center">{param.id}</td>
                          <td className="border px-2 py-2">{param.name}</td>
                          {batches[selectedBatch]?.students?.flatMap((regd) => 
                            [1, 2, 3, 4, 5].map((review, colIndex) => (
                              <td key={`${regd}-${review}`} className="border px-1 py-1">
                                <input
                                  type="number"
                                  className={`w-full p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    userRole !== "Faculty" ? "bg-gray-100" : ""
                                  }`}
                                  min="0"
                                  max="4"
                                  readOnly={userRole !== "Faculty"}
                                  value={reviews[selectedBatch]?.[regd]?.[`specific_${param.id}_review_${review}`] || ''}
                                  onChange={(e) => handleReviewChange(`specific_${param.id}`, e.target.value, regd, review)}
                                  onKeyPress={(e) => handleKeyPress(e, rowIndex, colIndex, 5)}
                                />
                              </td>
                            ))
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-2xl">
              {userRole === "Faculty" ? (
                <button 
                  onClick={handleSubmit}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300">
                  Submit Reviews
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-600">
                    <ShieldAlert size={18} className="mr-2" />
                    <span className="text-sm font-medium">Only faculty members can submit reviews</span>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="px-8 py-3 bg-red-700 text-white rounded-xl font-semibold shadow-lg hover:bg-red-900 transition-all duration-300">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Mark Attendance</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by registration number or batch..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(batches)
                  .filter(([batchNumber, batch]) => {
                    const searchLower = searchQuery.toLowerCase();
                    return batchNumber.toLowerCase().includes(searchLower) ||
                      batch.students.some(student => student.toLowerCase().includes(searchLower));
                  })
                  .map(([batchNumber, batch]) => (
                    <div key={batchNumber} className="bg-white rounded-lg border shadow-sm">
                      <div className="p-4 border-b bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-800">Batch {batchNumber}</h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {batch.students.map((student) => (
                            <div key={student} 
                              className={`p-3 rounded-lg border ${
                                attendanceData[student]?.present 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200'
                              }`}>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">{student}</span>
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                    checked={attendanceData[student]?.present || false}
                                    onChange={(e) => {
                                      setAttendanceData(prev => ({
                                        ...prev,
                                        [student]: { present: e.target.checked }
                                      }));
                                    }}
                                  />
                                  <span className="ml-2 text-sm text-gray-600">Present</span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleAttendanceSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle size={20} className="mr-2" />
                Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {isPerformanceModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-blue-900">Performance Overview</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <p className="text-black mt-2">Batch: {selectedBatch}</p>
            </div>

            {/* Table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2">Student</th>
                      {[1, 2, 3, 4].map(review => (
                        <th key={review} className="border px-4 py-2">Review {review}</th>
                      ))}
                      <th className="border px-4 py-2">Summative Review</th>
                      <th className="border px-4 py-2">Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches[selectedBatch]?.students.map((studentRegd) => (
                      <tr key={studentRegd}>
                        <td className="border px-4 py-2 font-medium">{studentRegd}</td>
                        {[1, 2, 3, 4].map(review => (
                          <td key={review} className="border px-4 py-2 text-center">
                            {calculateReviewTotal(selectedBatch, studentRegd, review)}
                          </td>
                        ))}
                        <td className="border px-4 py-2 text-center font-medium">
                          {calculateReviewTotal(selectedBatch, studentRegd, 5)}
                        </td>
                        <td className="border px-4 py-2 text-center font-bold">
                          {calculateTotalScores(selectedBatch, studentRegd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-6 border-t border-gray-200">
              <button 
                onClick={closeModal}
                className="w-full md:w-auto px-8 py-3 bg-red-700 text-white rounded-xl font-semibold shadow-lg hover:bg-red-900 transition-all duration-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Users,
  GraduationCap,
  ClipboardList,
  FileCheck,
  BookOpen,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [domains, setDomains] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState("promoted");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  const [uploadedData, setUploadedData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState({});
  const [statss, setStats] = useState(null);
  const [facultyGuides, setFacultyGuides] = useState({});
  const [selectedGuides, setSelectedGuides] = useState({});
  const [domainStats, setDomainStats] = useState({});
  const [finalizedProjects, setFinalizedProjects] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      if (!batches || Object.keys(batches).length === 0) {
        return; // Don't proceed if batches aren't loaded
      }
  
      setIsLoading(true);
      try {
        // Fetch students data
        const studentsResponse = await fetch('https://project-management-website-dovj.onrender.com/api/students');
        const studentsData = await studentsResponse.json();
  
        // Fetch uploaded data
        const uploadsResponse = await fetch('https://project-management-website-dovj.onrender.com/api/uploads/getfiles');
        const uploadsData = await uploadsResponse.json();
  
        const combinedData = studentsData
  .filter(student => {
    // Ensure student exists in uploadedData and is Promoted
    const uploadData = uploadsData.find(upload => upload.Regdno === student.registrationNumber);
    return uploadData && uploadData.status === "Promoted";
  })
  .map((student, index) => {
    const uploadData = uploadsData.find(upload => upload.Regdno === student.registrationNumber);
    const batchNo = batches[student.batchId?._id]?.batchNumber || '-';

    return {
      sNo: index + 1,
      batchNo: batchNo,
      regdNo: student.registrationNumber,
      projectType: uploadData?.projectType || 'Project',
      section: student.section,
      category: uploadData?.category || '-',
      studentNumber: uploadData?.mob || '-',
      fatherNumber: uploadData?.parmob || '-',
      guide: uploadData?.guide || '-',
      projectTitle: uploadData?.projectTitle || '-'
    };
  });

setFinalizedProjects(combinedData);

  
        // Correcting serial numbers (sNo)
        const finalDataWithSerial = combinedData.map((project, index) => ({
          ...project,
          sNo: index + 1 // Recalculate serial number based on the filtered data
        }));
  
        setFinalizedProjects(finalDataWithSerial);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [batches]); // Add batches as a dependency
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students data
        const studentsResponse = await fetch('https://project-management-website-dovj.onrender.com/api/students');
        const studentsData = await studentsResponse.json();
  
        // Fetch uploaded data
        const uploadsResponse = await fetch('https://project-management-website-dovj.onrender.com/api/uploads/getfiles');
        const uploadsData = await uploadsResponse.json();
  
        // Extract unique batch numbers from students data
        const batchNumbers = [...new Set(studentsData.map(student => 
          batches[student.batchId?._id]?.batchNumber
        ).filter(Boolean))];
  
        // Check which batches exist in the final collection
        const existingBatchGuides = {};
        for (let batchNo of batchNumbers) {
          try {
            // Fetch guide for the batch number
            const guideResponse = await fetch(`https://project-management-website-dovj.onrender.com/api/final/faculty/batch/${batchNo}`);
            
            if (guideResponse.ok) {
              const guideJson = await guideResponse.json();
              
              // Only save the guide if it exists in the final collection
              if (guideJson?.allocatedGuide) {
                existingBatchGuides[batchNo] = guideJson.allocatedGuide;
              }
            }
          } catch (error) {
            console.error(`Error fetching guide for batch ${batchNo}:`, error);
          }
        }
        const fetchProjectTitle = async (batchNumber) => {
          try {
            const response = await axios.get(`https://project-management-website-dovj.onrender.com/api/update/getTitle/${batchNumber}`);
            if (response.status === 200) {
              return response.data.title;
            } else {
              console.error("Batch not found.");
              return "-";
            }
          } catch (error) {
            console.error("Error fetching project title:", error);
            return "-";
          }
        };

        // Combine the data
        const combinedData = await Promise.all(studentsData.map(async (student, index) => {
          const uploadData = uploadsData.find(
            upload => upload.Regdno === student.registrationNumber
          );
  
          const batchNo = batches[student.batchId?._id]?.batchNumber || '-';
  
          // Fetch project title if not present in uploadData
          const projectTitle = uploadData?.projectTitle || 
                               await fetchProjectTitle(batchNo) || '-';
  
          return {
            sNo: index + 1,
            batchNo: batchNo,
            regdNo: student.registrationNumber,
            projectType: uploadData?.projectType || 'Project',
            section: student.section,
            category: uploadData?.category || '-',
            studentNumber: uploadData?.mob || '-',
            fatherNumber: uploadData?.parmob || '-',
            guide: existingBatchGuides[batchNo] || '-',
            projectTitle: projectTitle
          };
        }));
  
        // Filter out rows if any required column is missing
        const filteredData = combinedData.filter(item =>
          item.batchNo !== '-' &&   // Valid batch number
          item.regdNo &&            // Registration number present
          item.section &&           // Section present
          item.studentNumber !== '-' &&  // Student Number present
          item.fatherNumber !== '-'      // Father Number present
        );
  
        setFinalizedProjects(filteredData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [batches]);

  



  const filteredProjects = finalizedProjects.filter(project => {
    const searchString = searchQuery.toLowerCase();
    return (
      project.regdNo.toLowerCase().includes(searchString) ||
      project.projectTitle.toLowerCase().includes(searchString) ||
      project.guide.toLowerCase().includes(searchString) ||
      project.batchNo.toString().includes(searchString)
    );
  });
  

  useEffect(() => {
    if (facultyGuides && batches) {
      const stats = {};
      
      // Count batches per domain
      Object.values(batches).forEach((batch) => {
        if (batch.batchNumber !== "-") {
          stats[batch.title] = stats[batch.title] || { batches: 0, faculty: 0 };
          stats[batch.title].batches += 1;
        }
      });

      // Count faculty per domain
      Object.entries(facultyGuides).forEach(([domain, faculty]) => {
        if (stats[domain]) {
          stats[domain].faculty = faculty.length;
        }
      });

      setDomainStats(stats);
    }
  }, [facultyGuides, batches]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("https://project-management-website-dovj.onrender.com/api/students");
        const data = response.data;

        const groupedBatches = {};

        data.forEach((student) => {
          const batchId = student.batchId._id;

          if (!groupedBatches[batchId]) {
            groupedBatches[batchId] = {
              title: student.batchTitle,
              batchNumber: null,
              members: [],
            };
          }

          let status = student.promoted ? "Promoted" : "Not Promoted";

          groupedBatches[batchId].members.push({
            regNo: student.registrationNumber,
            section: student.section,
            status: status,
          });
        });

        if (uploadedData.length > 0) {
          uploadedData.forEach((row) => {
            Object.values(groupedBatches).forEach((batch) => {
              batch.members.forEach((member) => {
                if (member.regNo === row.Regdno && row.status === "Promoted") {
                  member.status = "Promoted";
                }
              });
            });
          });
        }

        let batchNumberCounter = 1;
        Object.values(groupedBatches).forEach((batch) => {
          const hasPromotedMember = batch.members.some(
            (member) => member.status === "Promoted"
          );
          
          if (hasPromotedMember) {
            batch.batchNumber = `Batch_${batchNumberCounter++}`;
          } else {
            batch.batchNumber = "-";
          }
        });

        const totalBatches = Object.keys(groupedBatches).length;
        const promotedBatches = Object.values(groupedBatches).filter(
          (batch) => batch.members.some(member => member.status === "Promoted")
        ).length;

        setBatches(groupedBatches);
        setStats({ totalBatches, promotedBatches });
        setStudents(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudents();
  }, [uploadedData]);

  useEffect(() => {
    const fetchUploadedData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://project-management-website-dovj.onrender.com/api/uploads/getfiles');
        const formattedData = response.data.map(row => ({
          name: row['Name'] || '',
          Regdno: row['Regdno'] || '',
          year: row['year'] || '',
          status: row['status'] || 'Promoted',
          parmob: row['parmob'] || '',
          mob: row['mob'] || '',
        }));
  
        setUploadedData(formattedData);
        setDisplayedData(formattedData);
      } catch (error) {
        console.error('Error fetching uploaded data:', error);
        setError(error.response?.status === 404
          ? 'Excel file not found. Please ensure the file exists in the uploads directory.'
          : 'Failed to load student data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUploadedData();
  }, []);

  useEffect(() => {
    if (!batches || Object.keys(batches).length === 0) {
      return;
    }
  
    const fetchFacultyGuides = async () => {
      const updatedGuides = {};
  
      await Promise.all(Object.values(batches).map(async (batch) => {
        const domain = batch.title;
        if (domain && domain !== "Unknown") {  
          try {
            const response = await axios.get(`https://project-management-website-dovj.onrender.com/api/domain-faculty/faculty/${domain}`);
  
            if (response.data && response.data.facultyNames) {
              updatedGuides[domain] = response.data.facultyNames;
            }
          } catch (error) {
            console.error(`Error fetching guides for ${domain}:`, error);
            updatedGuides[domain] = [];
          }
        }
      }));
  
      setFacultyGuides(updatedGuides);
    };
  
    fetchFacultyGuides();
  }, [batches]);

  const sidebarOptions = [
    { label: "Promoted Students", key: "promoted", icon: <GraduationCap size={20} /> },
    { label: "Batch Allocation", key: "batches", icon: <Users size={20} /> },
    { label: "Guide Assignments", key: "guide-report", icon: <BookOpen size={20} /> },
    { label: "Finalized Projects", key: "finalized", icon: <FileCheck size={20} /> },

  ];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option === "promoted") {
      setDisplayedData(uploadedData);
    }
    setSelectedBranch("All");
    setSelectedStatus("All");
    setSearchQuery("");
  };

  const filteredData = useMemo(() => {
    if (selectedOption === "promoted") {
      return displayedData.filter((item) => {
        const matchesSearch =
          String(item.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(item.Regdno).toLowerCase().includes(searchQuery.toLowerCase()) ;
  
        const matchesBranch = selectedBranch === "All" || item.branch === selectedBranch;
        const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
        
  
        return matchesSearch && matchesBranch && matchesStatus;
      });
    } else if (selectedOption === "batches") {
      if (!batches || Object.keys(batches).length === 0) return [];
  
      return Object.entries(batches).reduce((acc, [key, batch]) => {
        const filteredMembers = batch.members.filter((member) => {
          if (selectedStatus === "Promoted") {
            return member.status === "Promoted";
          } else if (selectedStatus === "Not Promoted") {
            return member.status === "Not Promoted";
          }
          return true;
        });
  
        if (filteredMembers.length > 0) {
          const matchesSearch =
            searchQuery === "" ||
            batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (batch.batchNumber !== "-" && String(batch.batchNumber).includes(searchQuery)) ||
            filteredMembers.some((member) =>
              member.regNo.toLowerCase().includes(searchQuery.toLowerCase())
            );
  
          if (matchesSearch) {
            acc[key] = {
              ...batch,
              members: filteredMembers,
            };
          }
        }
  
        return acc;
      }, {});
    } else if (selectedOption === "guide-report") {
      if (!batches || Object.keys(batches).length === 0) return [];
  
      const uniqueBatches = {};
      Object.values(batches).forEach((batch) => {
          if (batch.batchNumber !== "-") {
              uniqueBatches[batch.batchNumber] = {
                  batchNumber: batch.batchNumber,
                  domain: batch.title,
              };
          }
      });
  
      // Add search functionality for batchNumber and domain (title)
      if (searchQuery) {
          return Object.values(uniqueBatches).filter(batch =>
              batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
              batch.domain.toLowerCase().includes(searchQuery.toLowerCase())
          );
      }
  
      return Object.values(uniqueBatches);
  }
  
    return [];
  }, [selectedOption, displayedData, selectedBranch, selectedStatus, searchQuery, batches]);

  const stats = useMemo(() => {
    if (!displayedData.length) return null;
    return {
      total: displayedData.length,
      avgCGPA: (displayedData.reduce((acc, curr) => acc + (parseFloat(curr.cgpa) || 0), 0) / displayedData.length).toFixed(2),
      branchDistribution: Object.entries(
        displayedData.reduce((acc, curr) => {
          acc[curr.branch] = (acc[curr.branch] || 0) + 1;
          return acc;
        }, {})
      ),
    };
  }, [displayedData]);
  const downloadCSV3 = () => {
    if (!filteredProjects.length) return;

    const headers = [
      'S.No.',
      'Batch No.',
      'Regd.No.',
      'Project/Internship',
      'Section',
      'Category',
      'Student Number',
      'Father Number',
      'Name of the Guide',
      'Title of the project'
    ];

    const csvData = filteredProjects.map(project => [
      project.sNo,
      project.batchNo,
      project.regdNo,
      project.projectType,
      project.section,
      project.category,
      project.studentNumber,
      project.fatherNumber,
      project.guide,
      project.projectTitle
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finalized-projects.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  const downloadCSV = () => {
    if (!filteredData || !filteredData.length) {
      console.warn("No data available for download.");
      return;
    }

    const headers = ["Regdno", "Name", "mob", "parmob", "Status"];
    const rows = filteredData.map((row) =>
      [row.Regdno, row.name, row.mob, row.parmob, row.status].join(",")
    );
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedOption || "data"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCSV2 = () => {
    if (!batches || Object.keys(batches).length === 0) {
      console.warn("No batches data available for download.");
      return;
    }

    const headers = ["Regdno", "Section", "Batch Title", "Batch Number", "Status"];
    const rows = Object.values(filteredData).flatMap((batch) =>
      batch.members.map((member) => [
        member.regNo,
        member.section,
        batch.title,
        member.status === "Promoted" ? batch.batchNumber : "-",
        member.status,
      ])
    );

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedOption || "batches"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadGuideAssignmentCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      console.warn("No guide assignment data available for download.");
      return;
    }

    const headers = ["Batch Number", "Domain", "Allocated Guide"];
    const rows = filteredData.map((row) => [
      row.batchNumber,
      row.domain,
      selectedGuides[row.batchNumber] || "Not Assigned"
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "guide-assignments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex flex-1">
        <div className="w-72 bg-white dark:bg-gray-800 shadow-lg p-6 space-y-4">
          {sidebarOptions.map(({ label, key, icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick(key)}
              className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
                selectedOption === key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {icon}
              <span className="font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex-1 p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : displayedData.length === 0 && selectedOption === "promoted" ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No data available for the selected option.</p>
            </div>
          ) : (
            <>
              {selectedOption === "promoted" && stats && (
                <AnimatePresence>
                  {isStatsVisible && stats && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Students</h3>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-900">{stats.total}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {statss && selectedOption === "batches" && (
                <AnimatePresence>
                  {isStatsVisible && statss && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                          Total Batches
                        </h3>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-900"
                        >
                          {statss.totalBatches}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                          Promoted Batches
                        </h3>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-900">
                          {statss.promotedBatches}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {selectedOption === "guide-report" && (
                <>
                  <AnimatePresence>
                    {isStatsVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
                      >
                        {Object.entries(domainStats).map(([domain, stats]) => (
                          <div key={domain} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                              {domain}
                            </h3>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-900 dark:text-gray-900">
                                Batches: <span className="font-bold text-blue-900 dark:text-blue-900">{stats.batches}</span>
                              </p>
                              <p className="text-sm text-gray-900 dark:text-gray-900">
                                Faculty: <span className="font-bold text-green-900 dark:text-green-900">{stats.faculty}</span>
                              </p>
                              <p className="text-sm text-gray-900 dark:text-gray-900">
                              Batches per faculty: <span className="font-bold text-purple-900 dark:text-purple-900">
    {Math.ceil(stats.batches / (stats.faculty || 1))} 
  </span>
</p>


                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {selectedOption === "finalized" && (
                <AnimatePresence>
                  {isStatsVisible && finalizedProjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                         Batches
                        </h3>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-900">
                          {statss.promotedBatches}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex-1 min-w-[200px] max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={
                      selectedOption === "batches"
                        ? "Search by registration number, batch number..."
                        : selectedOption === "finalized"
                        ? "Search by registration number, guide, title..."
                        : "Search by name or registration number..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                  />
                </div>

                <div className="flex space-x-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
                  >
                    <option value="All">All Status</option>
                    <option value="Promoted">Promoted</option>
                    <option value="Not Promoted">Not Promoted</option>
                  </select>

                  <button
                    onClick={() => setIsStatsVisible(!isStatsVisible)}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all duration-300"
                  >
                    {isStatsVisible ? "Hide Stats" : "Show Stats"}
                  </button>

                  <button
                    onClick={() => {
                      if (selectedOption === "promoted") {
                        downloadCSV();
                      } else if (selectedOption === "batches") {
                        downloadCSV2();
                      } else if (selectedOption === "guide-report") {
                        downloadGuideAssignmentCSV();
                      } else if (selectedOption === "finalized") {
                        downloadCSV3();
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md 
hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md flex items-center"
                  >
                    <Download size={20} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {selectedOption === "promoted" && (
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Regdno</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Name</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Mobile Number</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Parent Mobile Number</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => (
                        <motion.tr
                          key={row.Regdno}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-900"
                          } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300`}
                        >
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{row.Regdno}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{row.name}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{row.mob}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{row.parmob}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                row.status === "Promoted"
                                  ? "bg-green-700 text-white"
                                  : "bg-red-700 text-white"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedOption === "batches" && (
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left table-auto bg-white dark:bg-gray-800 rounded-lg">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Regdno</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Section</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Domain</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Batch Number</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(filteredData).map(([batchId, batch]) =>
                        batch.members.map((member, memberIndex) => (
                          <motion.tr
                            key={`${batchId}-${memberIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: memberIndex * 0.05 }}
                            className={`${
                              memberIndex % 2 === 0
                                ? "bg-white dark:bg-gray-800"
                                : "bg-gray-50 dark:bg-gray-900"
                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300`}
                          >
                            <td className="p-4 border border-gray-200 dark:border-gray-600">{member.regNo}</td>
                            <td className="p-4 border border-gray-200 dark:border-gray-600">{member.section}</td>
                            <td className="p-4 border border-gray-200 dark:border-gray-600">{batch.title}</td>
                            <td className="p-4 border border-gray-200 dark:border-gray-600">
                              {member.status === "Promoted" ? batch.batchNumber : "-"}
                            </td>
                            <td className="p-4 border border-gray-200 dark:border-gray-600">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  member.status === "Promoted"
                                    ? "bg-gradient-to-r from-green-700 to-green-700 text-white"

                                    : "bg-gradient-to-r from-red-700 to-red-700 text-white"
                                }`}
                              >
                                {member.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedOption === "guide-report" && (
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Batch Number</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Domain</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Allocated Guide</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => (
                        <motion.tr
                          key={row.batchNumber}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-900"
                          } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300`}
                        >
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{row.batchNumber}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{row.domain}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">
                            <select
                              className="border p-2 rounded bg-white dark:bg-gray-700"
                              value={selectedGuides[row.batchNumber] || ""}
                              onChange={(e) =>
                                setSelectedGuides((prev) => ({
                                  ...prev,
                                  [row.batchNumber]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select Guide</option>
                              {facultyGuides[row.domain] && facultyGuides[row.domain].length > 0 ? (
                                facultyGuides[row.domain].map((guide, i) => (
                                  <option key={i} value={guide}>{guide}</option>
                                ))
                              ) : (
                                <option disabled>No guides available</option>
                              )}
                            </select>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedOption === "finalized" && (
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">S.No.</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Batch No.</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Regd.No.</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Project/Internship</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Section</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Category</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Student Number</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Father Number</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Name of the Guide</th>
                        <th className="p-4 border border-gray-200 dark:border-gray-600">Title of the project</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project, index) => (
                        <motion.tr
                          key={`${project.regdNo}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-900"
                          } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300`}
                        >
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.sNo}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.batchNo}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.regdNo}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.projectType}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.section}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.category}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.studentNumber}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.fatherNumber}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.guide}</td>
                          <td className="p-4 border border-gray-200 dark:border-gray-600">{project.projectTitle}</td>
                        </motion.tr>
                      ))}
                      {filteredProjects.length === 0 && (
                        <tr>
                          <td colSpan={10} className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No projects found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
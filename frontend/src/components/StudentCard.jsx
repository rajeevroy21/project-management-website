import React, { useEffect, useState } from 'react';
import { PieChart, XCircle, BookOpen, Award, Users, Sparkles, CheckCircle, AlertCircle, Crown } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Cookies from 'js-cookie';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

const StudentCard = () => {
    const [batches, setBatches] = useState({});
    const [studentPresent, setStudentPresent] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [batchTitle, setBatchTitle] = useState("");
    const [message, setMessage] = useState("");
    const [actualBatchTitle, setActualBatchTitle] = useState("");
    const [showReviews, setShowReviews] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guide, setGuide] = useState("Not Assigned");

    useEffect(() => {
        setLoading(true);

        // Fetch user data first
        fetch("https://project-management-website-dovj.onrender.com/api/faculties/user", { credentials: "include" })
            .then((res) => res.json())
            .then((userData) => {
                if (userData?.userId && userData?.authenticated && userData?.role === "student") {
                    setUserId(userData.userId);

                    // Now fetch batch data
                    return fetch("https://project-management-website-dovj.onrender.com/api/alloc/getBatches");
                } else {
                    throw new Error("User not authenticated or invalid role");
                }
            })
            .then((res) => res.json())
            .then((batchData) => {
                setBatches(batchData.batches);
                checkStudentPresence(batchData.batches, userId);  // Ensure userId is correctly passed
            })
            .catch((error) => {
                console.error("Error:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    

    useEffect(() => {
        if (selectedBatch) {
            fetch(`https://project-management-website-dovj.onrender.com/api/final/faculty/batch/${selectedBatch}`)
                .then(res => res.json())
                .then(data => {
                    if (data.allocatedGuide) {
                        setGuide(data.allocatedGuide);
                    }
                })
                .catch(error => console.error("Error fetching guide:", error));

            fetch(`https://project-management-website-dovj.onrender.com/api/review/reviews/${selectedBatch}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.reviews) {
                        setReviewData(data.reviews);
                    }
                })
                .catch((error) => console.error("Error fetching reviews:", error));
        }
    }, [selectedBatch]);

    const checkStudentPresence = (batches, studentRegd) => {
        for (const [batchNumber, batch] of Object.entries(batches)) {
            if (batch.students.includes(studentRegd)) {
                setStudentPresent(true);
                setSelectedBatch(batchNumber);
                return;
            }
        }
        setStudentPresent(false);
    };

    useEffect(() => {
        if (selectedBatch) {
            fetch(`https://project-management-website-dovj.onrender.com/api/update/getTitle/${selectedBatch}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.title) {
                        setBatchTitle("");
                        setActualBatchTitle(data.title);
                    }
                })
                .catch((error) => console.error("Error fetching title:", error));
        }
    }, [selectedBatch]);

    const calculateReviewTotal = (reviewNumber) => {
        if (!reviewData || !userId || !reviewData[userId]) return 0;
        
        let total = 0;
        
        // Calculate evaluation parameters total (max 4 points each)
        evaluationParameters.forEach(param => {
            const score = reviewData[userId][`param_${param.id}_review_${reviewNumber}`];
            if (score !== undefined) {
                total += parseInt(score);
            }
        });

        // Calculate project specific parameters total (max 5 points each)
        projectSpecificParameters.forEach(param => {
            const score = reviewData[userId][`specific_${param.id}_review_${reviewNumber}`];
            if (score !== undefined) {
                total += parseInt(score);
            }
        });

        return total;
    };

    const getPerformanceData = () => {
        if (!reviewData || !userId || !reviewData[userId]) return null;

        const totalScore = calculateTotalScore();
        const maxScore = 340; // (15 params * 4 points + 5 params * 5 points) * 4 reviews
        const percentage = (totalScore / maxScore) * 100;

        return {
            labels: ["Achieved Score", "Remaining"],
            datasets: [
                {
                    data: [percentage, 100 - percentage],
                    backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(229, 231, 235, 0.8)"],
                    hoverBackgroundColor: ["rgba(34, 197, 94, 1)", "rgba(229, 231, 235, 1)"],
                    borderWidth: 0,
                },
            ],
        };
    };

    const getReviewBarData = () => {
        if (!reviewData || !userId || !reviewData[userId]) return null;

        const reviews = [1, 2, 3, 4].map(review => calculateReviewTotal(review));
        
        return {
            labels: ['Review 1', 'Review 2', 'Review 3', 'Review 4'],
            datasets: [
                {
                    label: 'Score',
                    data: reviews,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    borderWidth: 0,
                    borderRadius: 6,
                }
            ]
        };
    };

    const handleShowPerformance = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleTitleSubmit = (e) => {
        e.preventDefault();
        if (!batchTitle.trim()) {
            setMessage("Title cannot be empty.");
            return;
        }

        const payload = {
            name: batchTitle,
        };

        fetch(`https://project-management-website-dovj.onrender.com/api/update/getTitle/${selectedBatch}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (response.ok) {
                    setMessage("Title updated successfully!");
                    setBatchTitle("");

                    fetch(`https://project-management-website-dovj.onrender.com/api/update/getTitle/${selectedBatch}`)
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.title) {
                                setActualBatchTitle(data.title);
                            }
                        })
                        .catch((error) => console.error("Error fetching updated title:", error));

                    fetch("https://project-management-website-dovj.onrender.com/api/alloc/getBatches")
                        .then((res) => res.json())
                        .then((data) => {
                            setBatches(data.batches);
                        })
                        .catch((error) => console.error("Error fetching batches:", error));
                } else {
                    setMessage("Failed to update title.");
                }
            })
            .catch((error) => {
                console.error("Error updating title:", error);
                setMessage("Error occurred while updating title.");
            });
    };

    const toggleReviews = () => {
        setShowReviews(!showReviews);
    };

    const getScoreStatus = (score) => {
        if (score >= 7.5) return { color: "text-green-600", icon: <CheckCircle size={16} className="text-green-600" /> };
        if (score >= 5) return { color: "text-blue-600", icon: <Sparkles size={16} className="text-blue-600" /> };
        if (score > 0) return { color: "text-yellow-600", icon: <AlertCircle size={16} className="text-yellow-600" /> };
        return { color: "text-gray-400", icon: <AlertCircle size={16} className="text-gray-400" /> };
    };

    const calculateTotalScore = () => {
        if (!reviewData || !userId || !reviewData[userId]) return 0;
        let total = 0;
        for (let i = 1; i <= 4; i++) {
            total += calculateReviewTotal(i);
        }
        return total;
    };

    const isHighAchiever = (totalScore) => {
        return totalScore > 50;
    };

    const getAchievementBadge = (totalScore) => {
        if (totalScore > 340) {
            return (
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-full shadow-lg animate-pulse">
                    <Crown size={24} className="text-white" />
                </div>
            );
        } else if (totalScore > 320) {
            return (
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-full shadow-lg">
                    <Crown size={24} className="text-white" />
                </div>
            );
        } else if (totalScore > 300) {
            return (
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-400 to-blue-600 p-2 rounded-full shadow-lg">
                    <Crown size={20} className="text-white" />
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-36 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {studentPresent && selectedBatch ? (
                    <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1"> {selectedBatch}</h2>
                                    <p className="text-purple-100">Project Status Dashboard</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <p className="font-medium">Guide: {guide}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Users size={20} className="mr-2 text-indigo-600" />
                                            Team Members
                                        </h3>
                                        <div className="space-y-2">
                                            {batches[selectedBatch]?.students.map((regNo, index) => (
                                                <div key={index} className="flex items-center py-2 px-3 bg-white rounded-lg shadow-sm border-l-4 border-indigo-500">
                                                    <span className={`${regNo === userId ? "font-bold text-indigo-700" : "text-gray-700"}`}>
                                                        {regNo} {regNo === userId && "(You)"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Award size={20} className="mr-2 text-indigo-600" />
                                            Project Guide
                                        </h3>
                                        <p className="text-gray-700 font-medium">{guide}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Project Title</h3>
                                        <form onSubmit={handleTitleSubmit} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Enter Project Title"
                                                value={batchTitle}
                                                onChange={(e) => setBatchTitle(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
                                            >
                                                Update Title
                                            </button>
                                        </form>
                                        {message && (
                                            <p className="mt-3 text-center text-sm font-medium text-gray-600">
                                                {message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="bg-gray-50 rounded-xl p-5 mb-6 relative">
                                        {reviewData && reviewData[userId] && isHighAchiever(calculateTotalScore()) && 
                                            getAchievementBadge(calculateTotalScore())
                                        }
                                        
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Sparkles size={20} className="mr-2 text-indigo-600" />
                                            Performance Overview
                                        </h3>
                                        
                                        {reviewData && reviewData[userId] ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-48 h-48 mb-4">
                                                    <Pie 
                                                        data={getPerformanceData()} 
                                                        options={{
                                                            plugins: {
                                                                legend: {
                                                                    display: false
                                                                }
                                                            },
                                                            cutout: '70%'
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-3xl font-bold ${calculateTotalScore() > 50 ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500" : "text-indigo-700"}`}>
                                                        {calculateTotalScore()}/340
                                                    </p>
                                                    <p className="text-sm text-gray-500">Total Score</p>
                                                    
                                                    {calculateTotalScore() > 300 && (
                                                        <div className="mt-2 bg-gradient-to-r from-yellow-50 to-amber-50 p-2 rounded-lg border border-yellow-200">
                                                            <p className="text-amber-700 font-medium flex items-center justify-center">
                                                                <Crown size={16} className="text-yellow-500 mr-1" />
                                                                {calculateTotalScore() > 340 ? "Outstanding Achievement!" : 
                                                                 calculateTotalScore() > 320 ? "Excellent Performance!" : 
                                                                 "Great Progress!"}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">No review data available yet</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <BookOpen size={20} className="mr-2 text-indigo-600" />
                                                Review Scores
                                            </h3>
                                            <button
                                                onClick={toggleReviews}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                {showReviews ? 'Hide Details' : 'Show Details'}
                                            </button>
                                        </div>
                                        
                                        {reviewData && reviewData[userId] ? (
                                            <div>
                                                {showReviews ? (
                                                    <div className="space-y-4">
                                                        <div className="h-64 mb-4">
                                                            <Bar 
                                                                data={getReviewBarData()}
                                                                options={{
                                                                    responsive: true,
                                                                    scales: {
                                                                        y: {
                                                                            beginAtZero: true,
                                                                            max: 85 // Updated max score per review
                                                                        }
                                                                    },
                                                                    plugins: {
                                                                        legend: {
                                                                            display: false
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        
                                                        <div className="bg-white rounded-lg shadow-sm p-4">
                                                            <table className="min-w-full">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="text-left py-2">Review</th>
                                                                        <th className="text-right py-2">Score</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {[1, 2, 3, 4].map((reviewNum) => {
                                                                        const score = calculateReviewTotal(reviewNum);
                                                                        const status = getScoreStatus(score);
                                                                        
                                                                        return (
                                                                            <tr key={reviewNum} className="border-b">
                                                                                <td className="py-3 flex items-center">
                                                                                    {status.icon}
                                                                                    <span className="ml-2">Review {reviewNum}</span>
                                                                                </td>
                                                                                <td className={`py-3 text-right ${status.color}`}>
                                                                                    {score}/85
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                    <tr className="bg-gray-50">
                                                                        <td className="py-3 font-bold">Total Score</td>
                                                                        <td className={`py-3 text-right font-bold ${
                                                                            calculateTotalScore() > 300 
                                                                            ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500" 
                                                                            : "text-green-600"
                                                                        }`}>
                                                                            {calculateTotalScore()}/340
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={handleShowPerformance}
                                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                                                        >
                                                            <PieChart size={20} className="mr-2" />
                                                            View Performance Chart
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">No review data available yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div >
    {/* Alert Icon Section */}
    <div className="flex justify-center mb-6">
        <div >
           
        </div>
    </div>

    {/* Image Section */}
    <div className="flex justify-center">
        <img 
            src="/Images/2133695.png" 
            alt="Uploaded" 
            className="w-[500px] md:w-[600px] lg:w-[700px] "
        />
    </div>

    {/* Message Section */}
    <p className="text-gray-700 text-2xl font-semibold text-center mt-2">
    🚨 You are not currently assigned to any project batch.  
    <br /> Please contact your administrator for assistance.
</p>

</div>

                )}
            </div>

            {showModal && reviewData && reviewData[userId] && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative">
                        {isHighAchiever(calculateTotalScore()) && getAchievementBadge(calculateTotalScore())}
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Performance Analysis</h3>
                            <XCircle
                                size={24}
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={handleCloseModal}
                            />
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="w-64 h-64 mb-6">
                                <Pie 
                                    data={getPerformanceData()}
                                    options={{
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        },
                                        cutout: '70%'
                                    }}
                                />
                            </div>
                            
                            <div className="text-center mb-6">
                                <p className={`text-4xl font-bold ${calculateTotalScore() > 300 ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500" : "text-indigo-700"}`}>
                                    {calculateTotalScore()}/340
                                </p>
                                <p className="text-gray-500">Total Score</p>
                                
                                {calculateTotalScore() > 300 && (
                                    <div className="mt-3 bg-gradient-to-r from-yellow-50 to-amber-50 p-2 rounded-lg border border-yellow-200 animate-pulse">
                                        <p className="text-amber-700 font-medium flex items-center justify-center">
                                            <Crown size={18} className="text-yellow-500 mr-2" />
                                            {calculateTotalScore() > 340 ? "Outstanding Achievement!" : 
                                             calculateTotalScore() > 320 ? "Excellent Performance!" : 
                                             "Great Progress!"}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <table className="w-full">
                                <tbody>
                                    {[1, 2, 3, 4].map((reviewNum) => {
                                        const score = calculateReviewTotal(reviewNum);
                                        const status = getScoreStatus(score);
                                        
                                        return (
                                            <tr key={reviewNum} className="border-b">
                                                <td className="py-3 flex items-center">
                                                    {status.icon}
                                                    <span className="ml-2">Review {reviewNum}</span>
                                                </td>
                                                <td className={`py-3 text-right ${status.color}`}>
                                                    {score}/85
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCard;
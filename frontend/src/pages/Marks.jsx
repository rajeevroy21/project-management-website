import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const ReviewTable = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');

    // Check user role from localStorage
    useEffect(() => {
        const storedUserRole = localStorage.getItem('userRole');
        setUserRole(storedUserRole);
    }, []);

    // Fetch all reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/review/reviews');
                setReviews(response.data.reviews || []); // Ensure it's always an array
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Failed to load reviews.');
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const downloadCSV = () => {
        if (reviews.length === 0) {
            alert('No data available for download.');
            return;
        }

        // Prepare CSV headers
        let csvContent = 'Batch Number,Reg. Number,Review 1,Review 2,Review 3,Review 4,Total\n';

        // Loop through the reviews to format them as CSV rows
        reviews.forEach(review => {
            if (review.reviews) {
                Object.entries(review.reviews).forEach(([regNo, marks]) => {
                    csvContent += `${review.batchNumber},${regNo},${marks.review1 || 0},${marks.review2 || 0},${marks.review3 || 0},${marks.review4 || 0},${marks.total || 0}\n`;
                });
            }
        });

        // Create a blob from the CSV string
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Create a link to download the blob
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'reviews.csv';
        link.style.display = 'none';
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up the DOM
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <div className="text-center mt-10 text-2xl text-blue-600 font-semibold">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-2xl text-red-600 font-semibold">{error}</div>;
    }

    // Conditionally render table based on user role
    if (userRole !== 'Project Coordinator' && userRole !== 'Faculty') {
        return <div className="text-center mt-10 text-2xl text-gray-600 font-semibold">Access Denied</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl transition duration-300 hover:shadow-xl">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={downloadCSV}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md flex items-center space-x-2"
                    >
                        <FontAwesomeIcon icon={faDownload} className="text-lg" />
                        <span>Download as CSV</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse rounded-xl shadow-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Batch Number</th>
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Reg. Number</th>
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Review 1</th>
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Review 2</th>
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Review 3</th>
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Review 4</th>
                                <th className="py-4 px-6 text-left uppercase text-sm font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800 dark:text-gray-300">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <React.Fragment key={review.batchNumber}>
                                        {review.reviews && Object.entries(review.reviews).map(([regNo, marks]) => {
                                            const isAllZero = marks.review1 === 0 && marks.review2 === 0 && marks.review3 === 0 && marks.review4 === 0;
                                            return (
                                                <tr
                                                    key={regNo}
                                                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 ${isAllZero ? 'bg-yellow-100' : ''}`}
                                                >
                                                    <td className="py-4 px-6">{review.batchNumber}</td>
                                                    <td className="py-4 px-6">{regNo}</td>
                                                    <td className="py-4 px-6">{marks.review1 || 0}</td>
                                                    <td className="py-4 px-6">{marks.review2 || 0}</td>
                                                    <td className="py-4 px-6">{marks.review3 || 0}</td>
                                                    <td className="py-4 px-6">{marks.review4 || 0}</td>
                                                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-gray-100">
                                                        {marks.total || 0}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-600">
                                        No reviews available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReviewTable;

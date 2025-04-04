import React, { useEffect, useState } from "react";
import Card from '../components/Card';
import StudentCard from '../components/StudentCard';
import { Search } from 'lucide-react';
import axios from 'axios';

function Progress() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [batches, setBatches] = useState({});
  const [filteredBatches, setFilteredBatches] = useState({});

  useEffect(() => {
    // Check authentication status first
    axios.get('https://project-management-website-dovj.onrender.com/api/faculties/auth-check', { withCredentials: true })
      .then(response => {
        setIsAuthenticated(response.data.isAuthenticated);
        
        // If authenticated, fetch user role
        if (response.data.isAuthenticated) {
          axios.get('https://project-management-website-dovj.onrender.com/api/faculties/user-role', { withCredentials: true })
            .then(roleResponse => {
              setUserRole(roleResponse.data.role);
            })
            .catch(error => {
              console.error("Error fetching user role:", error);
            });
          
          // Fetch batches data
          axios.get("https://project-management-website-dovj.onrender.com/api/alloc/getBatches", { withCredentials: true })
            .then((batchResponse) => {
              setBatches(batchResponse.data.batches);
              setFilteredBatches(batchResponse.data.batches);
            })
            .catch((error) => console.error("Error fetching batches:", error));
        }
      })
      .catch(error => {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    // Filter batches based on search query (batch number or registration number)
    if (searchQuery.trim() === "") {
      setFilteredBatches(batches);
    } else {
      const filtered = Object.entries(batches)
        .filter(([batchNumber, batch]) => 
          batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          batch.students.some(regNo => regNo.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      setFilteredBatches(filtered);
    }
  }, [searchQuery, batches]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto text-center mt-10">
        <h2 className="text-xl font-semibold mb-4">Please log in to access this page</h2>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Search Bar - Only for Faculty and Project Coordinator */}
      {(userRole === "Faculty" || userRole === "Project Coordinator") && (
        <div className="mb-6 relative max-w-md mx-auto">
          <div className="relative">
           
          </div>
        </div>
      )}

      {/* Render appropriate card based on user role */}
      <div>
        {userRole === "Faculty" ? (
          <Card 
            userRole={userRole} 
            allowSubmit={true} 
            readOnly={false} 
            filteredBatches={filteredBatches}
          />
        ) : userRole === "Project Coordinator" ? (
          <Card 
            userRole={userRole} 
            allowSubmit={false} 
            readOnly={true} 
            disableInputs={true} 
            filteredBatches={filteredBatches}
          />
        ) : (
          <StudentCard 
            userRole={userRole} 
            readOnly={true} 
            filteredBatches={filteredBatches}
          />
        )}
      </div>
    </div>
  );
}

export default Progress;
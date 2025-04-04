import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, Edit2, Plus, Check, X, Calendar, Clock, Info } from 'lucide-react';
import axios from 'axios'; // Using axios instead of js-cookie

const Announcements = () => {
  const [announcements, setAnnouncements] = useState(() => {
    const savedAnnouncements = localStorage.getItem('announcements');
    return savedAnnouncements ? JSON.parse(savedAnnouncements) : [];
  });
  const [isEditing, setIsEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    deadline: ''
  });
  const [userRole, setUserRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user role and authentication status from backend on component mount
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        // First check if user is authenticated
        const authResponse = await axios.get('https://project-management-website-dovj.onrender.com/api/faculties/auth-check', { withCredentials: true });
        setIsAuthenticated(authResponse.data.isAuthenticated);
        
        if (authResponse.data.isAuthenticated) {
          // If authenticated, fetch role
          const roleResponse = await axios.get('https://project-management-website-dovj.onrender.com/api/faculties/user-role', { withCredentials: true });
          setUserRole(roleResponse.data.role);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        // If there's an error, assume user is not authenticated
        setIsAuthenticated(false);
        setUserRole('');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRole();
  }, []);

  // Save announcements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  const isProjectCoordinator = userRole === 'Project Coordinator';

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleEdit = (announcement) => {
    setIsEditing(announcement.id);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      deadline: announcement.deadline
    });
  };

  const handleUpdate = (id) => {
    setAnnouncements(announcements.map(a => 
      a.id === id 
        ? {
            ...a,
            title: formData.title,
            message: formData.message,
            deadline: formData.deadline
          }
        : a
    ));
    setIsEditing(null);
    setFormData({ title: '', message: '', deadline: '' });
  };

  const handleAdd = () => {
    const newAnnouncement = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      deadline: formData.deadline,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowForm(false);
    setFormData({ title: '', message: '', deadline: '' });
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadlineDate) => {
    if (!deadlineDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(deadlineDate);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get appropriate color for deadline badge
  const getDeadlineColor = (daysRemaining) => {
    if (daysRemaining === null) return "bg-gray-100 text-gray-600";
    if (daysRemaining < 0) return "bg-red-100 text-red-800";
    if (daysRemaining <= 3) return "bg-yellow-100 text-yellow-800";
    if (daysRemaining <= 7) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  // Get deadline status text
  const getDeadlineText = (daysRemaining) => {
    if (daysRemaining === null) return "No deadline";
    if (daysRemaining < 0) return "Overdue";
    if (daysRemaining === 0) return "Due today";
    if (daysRemaining === 1) return "Due tomorrow";
    return `${daysRemaining} days remaining`;
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Megaphone className="w-8 h-8 mr-3 text-indigo-600" />
          {isProjectCoordinator ? 'Post Announcements' : 'Announcements'}
        </h1>
        {isAuthenticated && isProjectCoordinator && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write Announcement
          </button>
        )}
      </div>

      {showForm && isAuthenticated && isProjectCoordinator && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Announcement</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter announcement title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                placeholder="Enter your announcement message"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-32 resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ title: '', message: '', deadline: '' });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Post Announcement
            </button>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-100">
          <Info className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Announcements Yet</h3>
          <p className="text-gray-500">
            {isAuthenticated && isProjectCoordinator 
              ? "Create your first announcement by clicking the 'Write Announcement' button above."
              : "There are no announcements at this time. Check back later."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map(announcement => {
            const daysRemaining = getDaysRemaining(announcement.deadline);
            const deadlineColor = getDeadlineColor(daysRemaining);
            const deadlineText = getDeadlineText(daysRemaining);
            
            return (
              <div 
                key={announcement.id} 
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow"
              >
                {isEditing === announcement.id && isAuthenticated && isProjectCoordinator ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Edit Announcement</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setIsEditing(null);
                          setFormData({ title: '', message: '', deadline: '' });
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(announcement.id)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md flex items-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800">{announcement.title}</h2>
                      {isAuthenticated && isProjectCoordinator && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                            title="Edit announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-gray-600 whitespace-pre-line">
                      {announcement.message}
                    </div>
                    
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                      {announcement.deadline && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
                          <span className="text-gray-600">
                            Deadline: {formatDate(announcement.deadline)}
                          </span>
                        </div>
                      )}
                      
                      {announcement.createdAt && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                          <span className="text-gray-600">
                            Posted: {formatDate(announcement.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      {announcement.deadline && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${deadlineColor}`}>
                          {deadlineText}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Announcements;
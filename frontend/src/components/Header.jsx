import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Idea from '../../Images/idea.png';
import axios from 'axios';
import { 
  Home as HomeIcon, 
  LineChart, 
  Award, 
  Bell, 
  Info,
  LogIn,
  UserPlus,
  Upload,
  List,
  Menu,
  X
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("student");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch authentication status and user role on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authResponse = await axios.get(
          'https://project-management-website-dovj.onrender.com/api/faculties/auth-check',
          { withCredentials: true }
        );
        
        setIsAuthenticated(authResponse.data.isAuthenticated);
        
        // Only fetch role if authenticated
        if (authResponse.data.isAuthenticated) {
          try {
            const roleResponse = await axios.get(
              'https://project-management-website-dovj.onrender.com/api/faculties/user-role',
              { withCredentials: true }
            );
            setUserRole(roleResponse.data.role);
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, [user]); // Re-check when user state changes

  const handleLogout = async () => {
    try {
      // Call logout endpoint to destroy session on server
      await axios.post(
        'https://project-management-website-dovj.onrender.com/api/faculties/logout',
        {},
        { withCredentials: true }
      );
      
      // Update local state
      setUserRole(null);
      setIsAuthenticated(false);
      
      // Call auth context logout
      logout();
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#46c5e5] via-[#6D28D9] to-[#9333EA] text-white shadow-lg relative">
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-purple-700 focus:outline-none z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <img src={Idea} alt="Idea Icon" className="h-12 w-12" />
            <span className="font-bold text-xl text-[#090518]">
              Project <span className="text-[#f5f4f2]">Portal</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link to="/progress" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
              <LineChart className="h-4 w-4" />
              <span>Track Progress</span>
            </Link>
            <Link to="/announcements" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
              <Bell className="h-4 w-4" />
              <span>Announcements</span>
            </Link>
            <Link to="/about" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
              <Info className="h-4 w-4" />
              <span>About Us</span>
            </Link>
            {userRole === 'DEO' && (
              <Link to="/upload" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
            )}
            {userRole === 'Project Coordinator' && (
              <>
                <Link to="/uploads" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
                  <Upload className="h-4 w-4" />
                  <span>Uploads</span>
                </Link>
                <Link to="/list" className="relative flex items-center space-x-1 text-white after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#D4A017] after:rounded-full hover:after:w-full hover:after:h-[4px]">
                  <List className="h-4 w-4" />
                  <span>List</span>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Navigation - Side Menu */}
          <div className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#46c5e5] via-[#6D28D9] to-[#9333EA] transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
            <div className="flex flex-col p-6 space-y-4">
              <Link to="/" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link to="/progress" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                <LineChart className="h-5 w-5" />
                <span>Track Progress</span>
              </Link>
              <Link to="/announcements" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                <Bell className="h-5 w-5" />
                <span>Announcements</span>
              </Link>
              <Link to="/about" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                <Info className="h-5 w-5" />
                <span>About Us</span>
              </Link>
              {userRole === 'DEO' && (
                <Link to="/upload" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                  <Upload className="h-5 w-5" />
                  <span>Upload</span>
                </Link>
              )}
              {userRole === 'Project Coordinator' && (
                <>
                  <Link to="/uploads" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                    <Upload className="h-5 w-5" />
                    <span>Uploads</span>
                  </Link>
                  <Link to="/list" className="flex items-center space-x-2 text-white hover:bg-purple-700 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                    <List className="h-5 w-5" />
                    <span>List</span>
                  </Link>
                </>
              )}
              <div className="pt-4 border-t border-purple-400">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-white text-[#6D28D9] font-semibold px-4 py-2 rounded-xl shadow-lg border-2 border-[#6D28D9] hover:bg-gray-100 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/signup"
                      className="flex items-center justify-center space-x-2 bg-[#FFB900] text-[#1E293B] font-bold px-4 py-2 rounded-xl shadow-md border-2 border-[#FFB900] hover:bg-[#FFA500] w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Signup</span>
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center space-x-2 bg-white text-[#1E3A8A] font-semibold px-4 py-2 rounded-xl shadow-md border border-[#1E3A8A] hover:bg-gray-100 w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>

                <button
                  onClick={handleLogout}
                  className="bg-white text-[#6D28D9] font-semibold px-6 py-2 rounded-2xl shadow-lg border-2 border-[#6D28D9] hover:scale-105 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="flex items-center space-x-2 bg-[#FFB900] text-[#1E293B] font-bold px-6 py-2 rounded-xl shadow-md border-2 border-[#FFB900] hover:bg-[#FFA500] hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <UserPlus className="h-5 w-5 text-[#1E293B]" />
                  <span>Signup</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-white text-[#1E3A8A] font-semibold px-6 py-2 rounded-xl shadow-md border border-[#1E3A8A] hover:bg-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <LogIn className="h-5 w-5 text-[#1E3A8A]" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
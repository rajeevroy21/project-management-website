import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AlertCircle, Lock, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    type: 'faculty',
  });

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/students/login',
        {
          registrationNumber: formData.id,
          password: formData.password,
        },
        { withCredentials: true }
      );

      // We don't need to set token in login anymore, as we're using sessions
      login(response.data);

      toast.success('Login successful! Redirecting...', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px',
        },
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/faculties/login',
        {
          facultyId: formData.id,
          password: formData.password,
        },
        { withCredentials: true }
      );

      // Pass user data to login function
      login({
        name: response.data.name,
        authenticated: true
      });
      
      toast.success('Login successful! Redirecting...', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#FFFFFF',
          color: '#085c40',
          padding: '16px',
          borderRadius: '8px',
        },
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'transform -translate-y-32',
        }}
      />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-100">
          <div className="bg-blue-900 p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute transform rotate-45 bg-white"
                  style={{
                    width: '60px',
                    height: '60px',
                    left: `${i * 60}px`,
                    top: `${(i % 2) * 60}px`,
                  }}
                ></div>
              ))}
            </div>
            <div className="relative text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Vignan's Project Portal</h2>
              <p className="text-blue-100 text-sm">Login to your account</p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'student' })}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    formData.type === 'student'
                      ? 'bg-gradient-to-r from-teal-800 to-cyan-600 text-amber-500 shadow-md'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <img 
                    src={"/Images/Student.jpeg"} 
                    alt="Student" 
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'faculty' })}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    formData.type === 'faculty'
                      ? 'bg-gradient-to-r from-teal-800 to-cyan-600 text-amber-500 shadow-md'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <img 
                    src={"/Images/faculty.jpeg"} 
                    alt="Faculty" 
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold">Faculty</span>
                </button>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.type === 'student' ? 'Registration Number' : 'Faculty ID'}
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all duration-300"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                </div>
              </div>

              <button
                type="button"
                onClick={formData.type === 'student' ? handleStudentLogin : handleFacultyLogin}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#FFD700] to-[#fea707] text-blue-900 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
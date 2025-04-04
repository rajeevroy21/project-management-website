import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, UserCog, Lock, Loader2 } from 'lucide-react';

export default function FacultySignup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    facultyId: '',
    password: '',
    confirmPassword: '',
    role: 'Faculty'
  });

  const roles = ['DEO', 'Project Coordinator', 'Faculty'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/faculties', {
        facultyId: formData.facultyId,
        password: formData.password,
        role: formData.role
      });      
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-100">
          {/* Header */}
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
              <div className="inline-block p-3 rounded-full bg-gradient-to-r from-teal-800 to-cyan-600 mb-4">
                <UserCog className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Faculty Registration</h2>
              <p className="text-blue-100 text-sm">Create your faculty account</p>
            </div>
          </div>

          {/* Registration form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Faculty ID
                </label>
                <input
                  type="text"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all duration-300"
                  required
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
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
                    minLength={6}
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all duration-300"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#FFD700] to-[#fea707] text-blue-900 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Users, Lock, Loader2 } from 'lucide-react';

export default function StudentSignup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    students: [
      { regNo: '', section: 'A' },
      { regNo: '', section: 'A' },
      { regNo: '', section: 'A' },
    ],
    batchTitle: '',
    password: '',
    confirmPassword: ''
  });

  const sections = ['A', 'B', 'C', 'D'];

  const handleStudentChange = (index, field, value) => {
    const newStudents = [...formData.students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setFormData({ ...formData, students: newStudents });
  };

  const validateRegistrationNumber = (regNo) => {
    if (!regNo) return true;
    const regNoPattern = /^221FA04\d{3}$/;
    return regNoPattern.test(regNo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validStudents = formData.students.filter(student => student.regNo.trim() !== '');

    if (validStudents.length < 1) {
      setError('At least 1 student is required');
      setLoading(false);
      return;
    }

    if (!validateRegistrationNumber(formData.students[0].regNo)) {
      setError('Invalid registration number format');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const regNos = validStudents.map(student => student.regNo);
      const checkResponse = await axios.post('http://localhost:5000/api/students/check-students', { regNos });

      if (checkResponse.data.existingRegNos?.length > 0) {
        setError(`Registration numbers already exist: ${checkResponse.data.existingRegNos.join(', ')}`);
        setLoading(false);
        return;
      }

      const batchResponse = await axios.post('http://localhost:5000/api/batches', {
        title: formData.batchTitle,
        password: formData.password
      });

      const batchId = batchResponse.data._id;

      for (const student of validStudents) {
        await axios.post('http://localhost:5000/api/students', {
          registrationNumber: student.regNo,
          section: student.section,
          batchTitle: formData.batchTitle,
          batchId,
          password: formData.password
        });
      }

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
              <h2 className="text-3xl font-bold text-white mb-2">Student Batch Registration</h2>
              <p className="text-blue-100 text-sm">Register your project team</p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Domain</label>
                <select
                  value={formData.batchTitle}
                  onChange={(e) => setFormData({ ...formData, batchTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                  required
                >
                  <option value="">Select domain</option>
                  <option value="ML">Machine Learning</option>
                  <option value="DL">Deep Learning</option>
                  <option value="MSD">Modern Software Development</option>
                  <option value="Cryptography Network">Cryptography & Network Security</option>
                </select>
              </div>

              {formData.students.map((student, index) => (
                <div key={index} className="p-6 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">
                      Student {index + 1}
                      {index === 0 && <span className="ml-2 text-sm text-red-600">*</span>}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={student.regNo}
                      onChange={(e) => handleStudentChange(index, 'regNo', e.target.value.toUpperCase())}
                      placeholder="Registration Number"
                      className="px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                      required={index === 0}
                    />
                    <select
                      value={student.section}
                      onChange={(e) => handleStudentChange(index, 'section', e.target.value)}
                      className="px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                      required={index === 0}
                    >
                      {sections.map((section) => (
                        <option key={section} value={section}>Section {section}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                      required
                      minLength={6}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                      required
                      minLength={6}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                  </div>
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
                    Processing...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
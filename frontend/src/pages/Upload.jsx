import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import UploadedFiles from '../components/UploadedFiles'; // Import the new component

export default function Upload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for holding uploaded files

  // Fetch the list of uploaded files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('https://project-management-website-dovj.onrender.com/api/uploads/files');
        setUploadedFiles(response.data);
      } catch (err) {
        console.error('Error fetching files:', err);
      }
    };

    fetchFiles();
  }, [success]); // Re-fetch when a file is successfully uploaded

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.xlsx')) {
        setError('Please upload only Excel (.xlsx) files');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileDialog = () => {
    document.getElementById('file-upload').click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('https://project-management-website-dovj.onrender.com/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('File uploaded successfully!');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileName) => {
    // Trigger download of the file
    const link = document.createElement('a');
    link.href = `https://project-management-website-dovj.onrender.com/api/uploads/files/${fileName}`; // Updated to match the download route
    link.download = fileName;
    link.click();
  };

  const handleDelete = async (fileName) => {
    try {
      await axios.delete(`https://project-management-website-dovj.onrender.com/api/uploads/files/${fileName}`);
      setUploadedFiles(uploadedFiles.filter((file) => file !== fileName)); // Remove the deleted file from state
      setSuccess('File deleted successfully!');
    } catch (err) {
      setError('Error deleting file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Upload Promoted List
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 flex items-center p-4 bg-red-100 border-l-4 border-red-500 rounded-md">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center p-4 bg-green-100 border-l-4 border-green-500 rounded-md">
              <AlertCircle className="h-6 w-6 text-green-500 mr-3" />
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          )}

          <div className="mb-8 text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <button
                onClick={handleFileDialog}
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-indigo-700 transition-all"
              >
                <UploadIcon className="h-6 w-6 mr-2" />
                {file ? 'Change File' : 'Select File'}
              </button>
              {file && <p className="mt-4 text-gray-700 font-medium">{file.name}</p>}
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-lg text-white transition-all ${!file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
        </div>

        {/* Files List Section (Outside the upload box) */}
        <div className="mt-16">
          <UploadedFiles
            files={uploadedFiles}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

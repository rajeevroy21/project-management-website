import React from 'react';
import { FileSpreadsheet, Download, Trash } from 'lucide-react';

const UploadedFiles = ({ files, onDownload, onDelete }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* 2 files per row on medium and up screens */}
        {files.map((file, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg shadow-md hover:bg-gray-100 transition-all"
            style={{ width: '100%', minHeight: '220px' }} // Increased minimum height and ensured full width
          >
            {/* First line - File name */}
            <div className="flex items-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-gray-600 mr-3" /> {/* Icon size */}
              <p className="text-lg font-semibold">{file}</p>
            </div>

            {/* Second line - Download and Delete buttons */}
            <div className="flex justify-between gap-4 mt-4">
              <button
                onClick={() => onDownload(file)}
                className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700"
              >
                <Download className="h-6 w-6" /> {/* Icon size */}
              </button>
              <button
                onClick={() => onDelete(file)}
                className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700"
              >
                <Trash className="h-6 w-6" /> {/* Icon size */}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedFiles;

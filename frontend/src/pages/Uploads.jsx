import { useState, useEffect } from "react";
import { FileText, Trash2, Upload } from "lucide-react";

function Documents() {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [guideFile, setGuideFile] = useState(null);
    const [guideMessage, setGuideMessage] = useState("");
    const [studentFile, setStudentFile] = useState(null);
    const [studentMessage, setStudentMessage] = useState("");
    const [adminFile, setAdminFile] = useState(null);
    const [adminMessage, setAdminMessage] = useState("");
    
    // Fetch list of uploaded files from localStorage
    useEffect(() => {
        const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles"));
        if (storedFiles && Array.isArray(storedFiles)) {
            setFiles(storedFiles);
        } else {
            setFiles([]); 
        }
    }, []);

    // Handle file uploads
    const handleFileUpload = (file, url, setMessageFunc) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        fetch(url, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setMessageFunc(data.message);
                setFiles((prevFiles) => {
                    const updatedFiles = [...prevFiles, data.fileName];
                    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
                    return updatedFiles;
                });
            })
            .catch((error) => console.error("Error uploading file:", error));
    };

    // Handle file deletion
    const handleDelete = (fileName) => {
        fetch(`https://project-management-website-dovj.onrender.com/api/domain-faculty/files/${fileName}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.message);
                setFiles((prevFiles) => {
                    const updatedFiles = prevFiles.filter((file) => file !== fileName);
                    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
                    return updatedFiles;
                });
            })
            .catch((error) => console.error("Error deleting file:", error));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Upload Sections */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Domain Faculty Upload */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition duration-200 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Domain Faculty</h2>
                        </div>
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
                        />
                        <button
                            onClick={() => handleFileUpload(selectedFile, "https://project-management-website-dovj.onrender.com/api/domain-faculty/upload", setMessage)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                        {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
                    </div>

                    {/* Guide Data Upload */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition duration-200 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Guide Data</h2>
                        </div>
                        <input
                            type="file"
                            onChange={(e) => setGuideFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-3"
                        />
                        <button
                            onClick={() => handleFileUpload(guideFile, "https://project-management-website-dovj.onrender.com/api/final/uploadGuideInfo", setGuideMessage)}
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Guide
                        </button>
                        {guideMessage && <p className="text-green-600 mt-2 text-sm">{guideMessage}</p>}
                    </div>
{/* Admin Documents Upload */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition duration-200 hover:shadow-md">
    <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">Section Allotment Documents</h2>
    </div>
    <input
        type="file"
        onChange={(e) => setAdminFile(e.target.files[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-3"
    />
    <button
        onClick={() =>
            handleFileUpload(
                adminFile,
                "https://project-management-website-dovj.onrender.com/api/section/uploadSecAlloc",
                setAdminMessage
            )
        }
        className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
    >
        <Upload className="w-4 h-4" />
        Upload Admin Doc
    </button>
    {adminMessage && <p className="text-green-600 mt-2 text-sm">{adminMessage}</p>}
</div>

                    {/* Student Data Upload */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition duration-200 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Student Information</h2>
                        </div>
                        <input
                            type="file"
                            onChange={(e) => setStudentFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 mb-3"
                        />
                        <button
                            onClick={() => handleFileUpload(studentFile, "https://project-management-website-dovj.onrender.com/api/alloc/uploadStudentInfo", setStudentMessage)}
                            className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Student Info
                        </button>
                        {studentMessage && <p className="text-green-600 mt-2 text-sm">{studentMessage}</p>}
                    </div>
                </div>
           
                {/* File List Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="w-6 h-6 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-800">Uploaded Documents</h3>
                    </div>
                    {files.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No documents available</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {files.map((file) => (
                                <li key={file} className="flex justify-between items-center py-3 group hover:bg-gray-50 rounded-lg px-3">
                                    <span className="text-gray-700 truncate flex-1">{file}</span>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </li>
                            ))}
                            
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Documents;
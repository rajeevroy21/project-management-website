import React, { useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import Agreement from "./Agreement";
import Pagreement from "./Pagreement";

const SignupChoice = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [agreementType, setAgreementType] = useState(null); // Track whether student or faculty

  const openAgreement = (type) => {
    setAgreementType(type);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-12">
       Choose your Role
  
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Option */}
          <div
            onClick={() => openAgreement("student")}
            className="cursor-pointer flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-900"
          >
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
            <img 
    src={"/Images/student.jpeg"} 
    alt="Faculty" 
    className="h-20 w-20 rounded-full object-cover"
  />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Student</h2>
            <p className="text-black text-center">
              Register as a batch and start collaborating on your projects.
            </p>
          </div>

          {/* Faculty Option */}
          <div
            onClick={() => openAgreement("faculty")}
            className="cursor-pointer flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-900"
          >
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
            <img 
    src={"/Images/faculty.jpeg"} 
    alt="Faculty" 
    className="h-20 w-20 rounded-full object-cover"
  />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Faculty</h2>
            <p className="text-black text-center">
              Join as a faculty member to manage and guide student projects.
            </p>
          </div>
        </div>
      </div>

      {/* Agreement Modals */}
      {agreementType === "student" && <Agreement isOpen={isOpen} setIsOpen={setIsOpen} />}
      {agreementType === "faculty" && <Pagreement isOpen={isOpen} setIsOpen={setIsOpen} />}
    </div>
  );
};

export default SignupChoice;

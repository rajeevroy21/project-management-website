import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const agreementPages = [
  {
    title: "📌 Faculty Responsibilities and Guidelines",
    content: (
        <div className="text-gray-800 space-y-4 ">
        <p><strong>1. Provide Effective Guidance:</strong> Faculty members are expected to offer structured support to students, ensuring they comprehend project requirements and successfully address challenges.</p>
      
        <p><strong>2. Maintain a Project Diary:</strong> During each meeting or review session, document all tasks, discussions, and progress updates in the Project Diary. Faculty must verify and sign the diary, including the date and time, after every session.</p>
      
        <p><strong>3. Ensure Compliance with Department Guidelines:</strong> Students must strictly adhere to departmental regulations. Faculty should reinforce the importance of maintaining an up-to-date Project Diary and attending all scheduled reviews promptly.</p>
      
        <p><strong>4. Promote Student Engagement and Accountability:</strong> Encourage students to stay committed to their projects. Provide constructive feedback and ensure they meet key milestones and deadlines.</p>
       
       
      </div>
    ),
  },
  {
    title: "📌 Faculty Responsibilities and Guidelines",
    content: (
        <div className="text-gray-800 space-y-4 ">
             <p><strong>5. Allocate Availability for Student Meetings:</strong> Faculty should set aside dedicated time slots for one-on-one discussions with students to assess progress and provide valuable guidance.</p>
        <p><strong>6. Ensure Proper Documentation:</strong> Verify that all reports, endorsement forms, and summaries are accurately maintained in the Project Diary. Endorsement forms must be thoroughly reviewed before approval.</p>

<p><strong>7. Uphold Professional Conduct and Departmental Standards:</strong> Students should maintain proper etiquette and comply with departmental policies. Additionally, it is mandatory for them to produce a Scopus-Indexed Journal as part of their academic requirements.</p>
      </div>
    ),
  },
 
  {
    title: "📚 Guidelines for PRCs (Project Review Coordinators)",
    content: (
     <div>
       
       <p><strong>1. Review Scheduling:</strong> A one-week duration will be allocated for each review session. The Head of Department (HoD) nominee must coordinate with the panel members to agree on a mutually convenient time for conducting the reviews.</p>

<p><strong>2. Timely Review Completion:</strong> All reviews must be completed within the designated timeframe. Upon completion of the reviews, ensure that the attendance sheet is submitted to the Project Coordinator for record-keeping.</p>

<p><strong>3. Review Expectations:</strong> The review expectations, as previously shared, should be adhered to in order to properly assess the progress of student projects.</p>

<p><strong>4. Guide Endorsement Form Requirement:</strong> Only students who present the Guide Endorsement Form, duly signed by their guide, will be permitted to attend the reviews.</p>

<p><strong>5. Marks Documentation:</strong> All review reports, including marks, must be recorded directly in the Project Diary. The Project Coordinator will not provide separate forms or formats for review assessments.</p>

<p><strong>6. PRC Signatures:</strong> After each review, the members of the Project Review Committee (PRC) should sign their names at the bottom of the review report for each batch to validate the session.</p>

<p><strong>7. Communication with Project Coordinator:</strong> HoD nominees and PRC members are encouraged to contact the Project Coordinator for any clarifications or additional instructions related to the review process.</p>


     </div>
    ),
  },
 
];

const Agreement = ({ isOpen, setIsOpen }) => {
  const [index, setIndex] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-2xl p-6 bg-white rounded-lg shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-blue-900 border-b pb-2">
          {agreementPages[index].title}
        </h2>
        <div className="mt-4">{agreementPages[index].content}</div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between items-center w-full">
          {index > 0 && (
            <button
              onClick={() => setIndex(index - 1)}
              className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600 transition"
            >
              ⬅ Back
            </button>
          )}
          {index < agreementPages.length - 1 ? (
            <button
              onClick={() => setIndex(index + 1)}
              className="px-4 py-2 bg-blue-800 text-white rounded shadow hover:bg-blue-900 transition"
            >
              Next ➡
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="w-5 h-5 accent-blue-800 cursor-pointer"
              />
              <label className="text-gray-700">I agree to the terms</label>
              <button
                onClick={() => {
                  if (agreed) {
                    setIsOpen(false);
                    navigate("/signup/faculty"); // Redirect to student login
                  }
                }}
                className={`px-4 py-2 rounded shadow ${
                  agreed
                    ? "bg-green-600 text-white hover:bg-green-700 transition"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={!agreed}
              >
                ✅ Accept
              </button>
            </div>
          )}
        </div>

        {/* Close Modal Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            
          }}
          className="absolute top-4 right-4 text-gray-600 text-lg hover:text-red-500 transition"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Agreement;

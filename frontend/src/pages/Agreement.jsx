import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const agreementPages = [
  {
    title: "📌 Attendance Guidelines",
    content: (
      <div className="text-gray-700 space-y-1 leading-relaxed">
       <p>
    <strong className="text-gray-900">1. Minimum Attendance Requirement:</strong> Students must maintain a 
    minimum of <strong>80% attendance</strong>. It is essential to meet assigned guides regularly and arrive 
    at the department <strong>by 8:15 AM</strong> each day.
  </p>

  <p>
    <strong className="text-gray-900">2. Late Attendance Requests:</strong> Any student requesting attendance 
    from the Department Examination Officer (DEO) after <strong>8:25 AM</strong> will not be considered.
  </p>

  <p>
    <strong className="text-gray-900">3. Attendance Recording Times:</strong> Attendance will be recorded 
    at three intervals during the day:
  </p>
  <ul className="list-disc pl-6 space-y-1">
    <li><strong>Morning:</strong> Before <strong>8:25 AM</strong> (start of the day).</li>
    <li><strong>Midday:</strong> Between <strong>10:25 AM - 1:00 PM</strong> (covering periods 3 to 5).</li>
    <li><strong>Afternoon:</strong> Between <strong>2:00 PM - 3:50 PM</strong> (covering late afternoon sessions).</li>
  </ul>

  <p>
    <strong className="text-gray-900">4. Post-Attendance Requests:</strong> Once attendance has been recorded, 
    no <strong>adjustments or modifications</strong> will be entertained by the DEO.
  </p>

  <p>
    <strong className="text-gray-900">5. Absence Due to Guide Meetings:</strong> If a student misses attendance 
    due to a meeting with their guide, they must present their <strong>Project Diary</strong> (duly signed by the guide 
    with the meeting time) to the DEO to obtain attendance.
  </p>

  <p>
    <strong className="text-gray-900">6. Attendance for Teaching Assistants (TAs):</strong> TAs engaged in classes 
    during attendance recording periods must submit a <strong>signed TA slip</strong> from the respective faculty to the 
    DEO for attendance approval.
  </p>

      </div>
    ),
  },
  {
    title: "📚 Project Diary",
    content: (
     <div>
        <p>
    <strong className="text-gray-900">1. Project Diary Acquisition:</strong> Every batch must acquire a 
    <strong> Project Diary</strong>, available at the Xerox shop. Students must carry it regularly to 
    record all necessary activities and information.
  </p>

  <p>
    <strong className="text-gray-900">2. Daily Updates and Guide Signature:</strong> Students should bring their 
    Project Diary to their guide every day. All meetings, work progress, and relevant details must 
    be recorded with the date and time. The guide must <strong>sign</strong> after each meeting or review session.
  </p>

  <p>
    <strong className="text-gray-900">3. Important Content in the Project Diary:</strong> The diary must include:
  </p>
  <ul className="list-disc pl-6 space-y-1">
    <li><strong>Review reports:</strong> (0th to 3rd review reports).</li>
    <li><strong>Guide Endorsement Forms.</strong></li>
    <li><strong>Summaries of review reports.</strong></li>
    <li>Any other documentation or feedback related to the project.</li>
  </ul>

  <p>
    <strong className="text-gray-900">4. Guide Endorsement Form:</strong> Before attending each review, students 
    must obtain the guide’s <strong>signature</strong> on the Guide Endorsement Form. This is mandatory for review attendance.
  </p>

  <p>
    <strong className="text-gray-900">5. Review Attendance and Project Progress:</strong> Students will be assessed 
    during reviews, and marks will be awarded accordingly. These marks are documented in the Project Diary.
  </p>

 
     </div>
    ),
  },
  {
    title: "📚 Project Diary",
    content: (
     <div>
       

  <p>
    <strong className="text-gray-900">6. Submission of Review Reports:</strong> Each batch must submit a 
    <strong> Xerox copy</strong> of the review report to the Project Coordinator. Failure to submit will result in an 
    <strong>absence</strong> for that review, leading to a score of zero.
  </p>

  <p>
    <strong className="text-gray-900">7. Project Diary Safety:</strong> Since the diary contains crucial data (marks, 
    endorsements, review details), students must take proper care to avoid losing or misplacing it. It is 
    recommended to keep a <strong>backup copy</strong>.
  </p>

  <p>
    <strong className="text-gray-900">8. Timely Completion of Project Work:</strong> Students must complete all 
    project tasks, milestones, and reviews <strong>within the given deadlines</strong>. Delays may impact attendance 
    and review scores.
  </p>

  <p>
    <strong className="text-gray-900">9. Project Work Updates:</strong> Keep your project work updated regularly. 
    Ensure progress aligns with the project plan and guide expectations. If you face challenges, 
    seek guidance promptly.
  </p>

  <p>
    <strong className="text-gray-900">10. Documentation and Reports:</strong> All review reports, progress updates, 
    and feedback must be accurately documented in the Project Diary. These documents are essential 
    for evaluation and project performance assessment.
  </p>
     </div>
    ),
  },
  {
    title: "🎓 Department Etiquette",
    content: (
        <div className="text-gray-700 space-y-1 leading-relaxed">
        <p>
          <strong className="text-gray-900">1. Punctuality and Professionalism:</strong> Be regular and punctual. Arrive at the venue by 
          <strong> 8:15 AM</strong> and stay until after <strong>3:50 PM</strong>. Treat the project work with seriousness and ensure that you 
          adhere to the formal dress code. Avoid unnecessary roaming in the corridors and ensure that campus infrastructure 
          is respected and not damaged.
        </p>
      
        <p>
          <strong className="text-gray-900">2. Respectful Interaction:</strong> Be polite and professional while interacting with faculty and staff, 
          especially when they are taking attendance or providing guidance.
        </p>
      
        <p>
          <strong className="text-gray-900">3. Leave Notifications:</strong> Inform your guide in advance if you intend to take any leave, and 
          provide a valid reason for your absence.
        </p>
      
        <p>
          <strong className="text-gray-900">4. Polite Communication with DEOs:</strong> Approach the DEO politely when requesting attendance, 
          whether you are a student or a Teaching Assistant (TA). Always maintain respectful communication.
        </p>
      
        <p>
          <strong className="text-gray-900">5. Absence from Reviews:</strong> If you are unable to attend a review, seek prior permission from your 
          guide and department. Ensure that all necessary documentation (such as the <strong>Guide Endorsement Form</strong>) is properly handled 
          to avoid missing marks.
        </p>
      
      
      </div>
    ),
  },
  {
    title: "🎓 Department Etiquette",
    content: (
        <div className="text-gray-700 space-y-1 leading-relaxed">
       
        <p>
          <strong className="text-gray-900">6. Professional Conduct:</strong> Always maintain professional behavior while on campus. This includes 
          respecting your peers, adhering to departmental rules, and maintaining a focus on your academic and project responsibilities.
        </p>
      
        <p>
          <strong className="text-gray-900">7. Use of Resources:</strong> Use the department’s resources responsibly and for their intended purposes. 
          Ensure that equipment, software, and other materials are used in a manner that supports your academic and project work.
        </p>
      
        <p>
          <strong className="text-gray-900">8. Collaboration and Teamwork:</strong> In group projects, students are expected to collaborate 
          effectively with team members. Maintain clear communication and ensure that each team member is contributing to the overall success of the project.
        </p>
      
        <p>
          <strong className="text-gray-900">9. Feedback and Queries:</strong> If you need clarification or feedback regarding your project, 
          approach your guide or faculty members professionally and respectfully. Make sure to document all feedback in your <strong>Project Diary</strong>.
        </p>
      
        <p>
          <strong className="text-gray-900">10. Adherence to Deadlines:</strong> Meeting deadlines is critical to the successful completion of your project. 
          Ensure that all project tasks, submissions, and reviews are completed within the stipulated timelines.
        </p>
      
        <p>
          By adhering to these guidelines, you will not only ensure compliance with departmental expectations but also enhance your 
          academic performance and project outcomes.
        </p>
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
                className="w-5 h-5 accent-blue-900 cursor-pointer"
              />
              <label className="text-gray-700">I agree to the terms</label>
              <button
                onClick={() => {
                  if (agreed) {
                    setIsOpen(false);
                    navigate("/signup/student"); // Redirect to student login
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
          className="absolute top-4 right-4 text-red-900 text-lg hover:text-red-500 transition"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Agreement;

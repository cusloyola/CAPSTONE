import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const InspectionChecklistReport = () => {
  // Sample project names for the dropdown

  const [user, setUser] = useState(null);
  // State for general report information
  const [reportInfo, setReportInfo] = useState({
    projectName: '', // Default to "Select Project"
    date: '',
    inspector: '', // Inspector name is static
  });
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    console.log("storedUser from localStorage:", storedUser); // <-- Add this line
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setReportInfo(prev => ({
        ...prev,
        inspector: parsedUser.name || "Unknown Inspector", // Adjust property as needed
      }));
    }
  }, []);

  // State for modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State for custom date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);
  const dateInputRef = useRef(null);
  const [projectList, setProjectList] = useState([]);
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/checklist');
        console.log("Fetched Checklist Response:", res.data);

        // Correctly access the array inside the "checklist" property
        if (Array.isArray(res.data.checklist)) {
          setChecklist(res.data.checklist);
        } else {
          console.error("❌ checklist is not an array:", res.data.checklist);
        }
      } catch (err) {
        console.error('❌ Error fetching checklist:', err);
      }
    };

    fetchChecklist();
  }, []);


  useEffect(() => {
    const fetchProject = async () => {
      try {

        const response = await fetch("http://localhost:5000/api/projects");
        const data = await response.json();
        setProjectList(data);
        console.log("Fetched Projects:", data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      };
    };
    fetchProject();
  }, []);

  // Handle clicks outside the date picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) &&
        dateInputRef.current && !dateInputRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle changes in general report info fields
  const handleReportInfoChange = (e) => {
    const { name, value } = e.target;
    setReportInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes in checklist item responses (Yes/No/NA)
  const handleResponseChange = (sectionIndex, itemIndex, responseValue) => {
    setChecklist(prevChecklist => {
      const newChecklist = [...prevChecklist];
      newChecklist[sectionIndex].items[itemIndex].response = responseValue;
      return newChecklist;
    });
  };

  // Handle changes in "Action required" text areas
  const handleActionRequiredChange = (sectionIndex, value) => {
    setChecklist(prevChecklist => {
      const newChecklist = [...prevChecklist];
      // Update all items' actionRequired in that section with the same text.
      newChecklist[sectionIndex].items.forEach(item => {
        item.actionRequired = value;
      });
      return newChecklist;
    });
  };

  // Handle form submission - show confirmation modal
  const handleSubmit = (e) => {
    if (!reportInfo.date) {
      alert("Please select a date.");
      return;
    }
    if (!reportInfo.inspector) {
      alert("Inspector name is missing.");
      return;
    }
    if (!checklist.length) {
      alert("Checklist is empty.");
      return;
    }

    e.preventDefault();
    if (!reportInfo.projectName) {
      alert("Please select a project.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Confirm submission after user clicks "Yes" in confirmation modal
  const confirmSubmit = async () => {
    setShowConfirmModal(false);

    try {
      const payload = {
        project_name: reportInfo.projectName,
        report_date: reportInfo.date,
        inspector: reportInfo.inspector,
        checklist: checklist
      };

      console.log("Submitting payload:", payload); // <-- Add this line

      await axios.post("http://localhost:5000/api/inspection/inspection-reports", payload);
      setShowSuccessModal(true);

      // Reset
      setReportInfo({
        projectName: '',
        date: '',
        inspector: '',
      });
      setChecklist([]);
    } catch (err) {
      console.error("❌ Error submitting report:", err);
    }
  };


  // Date Picker Logic
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderDays = () => {
    const numDays = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 flex items-center justify-center"></div>);
    }

    // Fill days of the month
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isSelected = reportInfo.date === date.toISOString().split('T')[0];
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={`day-${i}`}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isToday && !isSelected ? 'border border-blue-500 text-blue-700' : ''}
            ${!isSelected && !isToday ? 'hover:bg-gray-200' : ''}
          `}
          onClick={() => selectDay(date)}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const selectDay = (date) => {
    setReportInfo(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
    setShowDatePicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans flex justify-center items-start">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-6 border-b-2 border-blue-600 pb-3">
          Inspection Checklist Report        </h1>

        {/* Project Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <select
              id="projectName"
              name="projectName"
              value={reportInfo.projectName}
              onChange={handleReportInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Project</option> {/* Add this line */}
              {projectList.map((project) => (
                <option key={project.id} value={project.project_name}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative"> {/* Added relative for date picker positioning */}
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="text" // Changed to text input
              id="date"
              name="date"
              value={reportInfo.date}
              readOnly // Make it read-only to force selection via picker
              onClick={() => setShowDatePicker(true)} // Show date picker on click
              ref={dateInputRef} // Ref for click outside detection
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 cursor-pointer focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="YYYY-MM-DD"
            />
            {showDatePicker && (
              <div ref={datePickerRef} className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
                <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <span className="font-semibold text-gray-800">{months[currentMonth]} {currentYear}</span>
                  <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
                  ))}
                  {renderDays()}
                </div>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-1">Inspector</label>
            <p className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 text-gray-700 sm:text-sm">
              {reportInfo.inspector}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-8 rounded-md shadow-sm">
          <p className="font-semibold text-lg mb-2">INSTRUCTIONS:</p>
          <p className="text-sm">
            This checklist is designed to ensure a thorough inspection of the construction site. Carefully review each item
            and mark the corresponding option for compliance or note any issues identified. Use the "Action required, if any" section
            to provide additional details and actions required.
          </p>
        </div>

        {/* Checklist Sections */}
        <form onSubmit={handleSubmit}>
          {checklist.map((section, sectionIndex) => (
            <div key={section.section} className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                {section.section}
              </h2>

              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center py-3 border-b border-gray-100 last:border-b-0">
                  <p className="text-base text-gray-700 flex-1 mb-2 sm:mb-0 mr-4">{item.text}</p>
                  <div className="flex space-x-4 flex-shrink-0">
                    {['Yes', 'No', 'NA'].map(option => (
                      <label key={option} className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`item-${sectionIndex}-${itemIndex}`}
                          value={option}
                          checked={item.response === option}
                          onChange={() => handleResponseChange(sectionIndex, itemIndex, option)}
                          className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/*               <div className="mt-6">
                <label htmlFor={`action-required-${sectionIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Action required, if any
                </label>
                <textarea
                  id={`action-required-${sectionIndex}`}
                  rows="3"
                  value={section.actionRequired || ""}
                  onChange={(e) => handleActionRequiredChange(sectionIndex, e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter any actions required for this section..."
                ></textarea>
              </div> */}
            </div>
          ))}

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out text-lg"
            >
              SUBMIT REPORT
            </button>
          </div>
        </form>


        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md text-center w-80 font-sans">
              <h2 className="text-lg font-semibold mb-4">Confirm Submission</h2>
              <p className="mb-4">Are you sure you want to submit this report?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150 ease-in-out"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md text-center w-80 font-sans">
              <h2 className="text-lg font-semibold mb-2 text-green-600">Submitted Successfully!</h2>
              <p className="mb-4">Your report has been submitted.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionChecklistReport;

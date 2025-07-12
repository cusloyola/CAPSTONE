import React, { useState, useRef, useEffect } from 'react';

const InspectionChecklistReport = () => {
  // Sample project names for the dropdown
  const projectNames = [
    "Select Project",
    "Project Alpha Construction",
    "Project Beta Renovation",
    "Project Gamma Infrastructure",
    "Project Delta Expansion",
    "Project Epsilon Demolition",
  ];

  // Static inspector name
  const staticInspectorName = "Maria De Guzman";

  // State for general report information
  const [reportInfo, setReportInfo] = useState({
    projectName: projectNames[0], // Default to "Select Project"
    date: '',
    inspector: staticInspectorName, // Inspector name is static
  });

  // State for modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State for custom date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);
  const dateInputRef = useRef(null);

  // Structure for the checklist items
  const initialChecklist = [
    {
      section: "1. GENERAL SAFETY",
      items: [
        { id: "gs1", text: "Adequate signage and barricades are in place.", response: null, actionRequired: "" },
        { id: "gs2", text: "Personal protective equipment (PPE) is being worn by workers.", response: null, actionRequired: "" },
        { id: "gs3", text: "Emergency contact information is prominently displayed.", response: null, actionRequired: "" },
        { id: "gs4", text: "First aid kits and fire extinguishers are readily accessible.", response: null, actionRequired: "" },
        { id: "gs5", text: "Scaffolding and ladders are secure and in good condition.", response: null, actionRequired: "" },
      ],
    },
    {
      section: "2. SITE ORGANIZATION",
      items: [
        { id: "so1", text: "Construction materials are properly stored and organized.", response: null, actionRequired: "" },
        { id: "so2", text: "Waste and debris are regularly removed from the site.", response: null, actionRequired: "" },
        { id: "so3", text: "Equipment and tools are appropriately stored when not in use.", response: null, actionRequired: "" },
        { id: "so4", text: "Access routes and walkways are clear and well-maintained.", response: null, actionRequired: "" },
        { id: "so5", text: "Temporary fencing or barriers are installed where required.", response: null, actionRequired: "" },
      ],
    },
    {
      section: "3. STRUCTURAL SAFETY",
      items: [
        { id: "ss1", text: "Foundations and structural components are being constructed as per design specifications.", response: null, actionRequired: "" },
        { id: "ss2", text: "Reinforcement and formwork are properly installed and secured.", response: null, actionRequired: "" },
        { id: "ss3", text: "Proper curing measures are in place for concrete elements.", response: null, actionRequired: "" },
        { id: "ss4", text: "Shoring and bracing are used where necessary and correctly placed.", response: null, actionRequired: "" },
        { id: "ss5", text: "Structural steel components are secure, correctly installed, and aligned.", response: null, actionRequired: "" },
      ],
    },
    {
      section: "4. ELECTRICAL SYSTEMS",
      items: [
        { id: "es1", text: "Electrical installations comply with local regulations and codes.", response: null, actionRequired: "" },
        { id: "es2", text: "Proper grounding measures are implemented.", response: null, actionRequired: "" },
        { id: "es3", text: "Wiring and connections are safely installed and protected", response: null, actionRequired: "" },
        { id: "es4", text: "Electrical panels and junction boxes are properly labeled.", response: null, actionRequired: "" },
        { id: "es5", text: "Temporary electrical installations are secured and inspected regularly", response: null, actionRequired: "" },
      ],
    },
    {
      section: "5. PLUMBING AND MECHANICAL SYSTEMS",
      items: [
        { id: "pm1", text: "Plumbing installations comply with local regulations and codes.", response: null, actionRequired: "" },
        { id: "pm2", text: "Water supply lines are leak-free and properly connected.", response: null, actionRequired: "" },
        { id: "pm3", text: "Drainage systems are functioning correctly.", response: null, actionRequired: "" },
        { id: "pm4", text: "Mechanical equipment and systems are installed and operating as per design.", response: null, actionRequired: "" },
        { id: "pm5", text: "HVAC systems are properly maintained and provide adequate ventilation.", response: null, actionRequired: "" },
      ],
    },
    {
      section: "6. HAZARDOUS MATERIALS",
      items: [
        { id: "hm1", text: "Proper handling and storage of hazardous materials (e.g., chemicals, fuels) are observed.", response: null, actionRequired: "" },
        { id: "hm2", text: "Hazardous waste is being appropriately disposed of.", response: null, actionRequired: "" },
        { id: "hm3", text: "Material Safety Data Sheets (MSDS) are readily available for all hazardous substances used on-site.", response: null, actionRequired: "" },
        { id: "hm4", text: "Spill response measures and cleanup kits are in place.", response: null, actionRequired: "" },
      ],
    },
    {
      section: "7. WORKFORCE SAFETY",
      items: [
        { id: "ws1", text: "Workers are trained on safety procedures and have appropriate certifications.", response: null, actionRequired: "" },
        { id: "ws2", text: "Fall protection measures are in place where there is a risk of falling.", response: null, actionRequired: "" },
        { id: "ws3", text: "Personal protective equipment (PPE) is being used correctly.", response: null, actionRequired: "" },
        { id: "ws4", text: "Work areas are adequately illuminated.", response: null, actionRequired: "" },
        { id: "ws5", text: "Equipment operators are properly trained and certified.", response: null, actionRequired: "" },
      ],
    },
    {
      section: "8. DOCUMENTATION AND PERMITS",
      items: [
        { id: "dp1", text: "Building permits and relevant documents are posted and up to date.", response: null, actionRequired: "" },
        { id: "dp2", text: "Inspection reports and records are being maintained.", response: null, actionRequired: "" },
        { id: "dp3", text: "Safety plans and hazard assessments are available and followed.", response: null, actionRequired: "" },
        { id: "dp4", text: "Daily construction logs are being recorded.", response: null, actionRequired: "" },
        { id: "dp5", text: "Subcontractor licenses and insurance certificates are on file.", response: null, actionRequired: "" },
      ],
    },
  ];

  const [checklist, setChecklist] = useState(initialChecklist);

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
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Confirm submission after user clicks "Yes" in confirmation modal
  const confirmSubmit = () => {
    setShowConfirmModal(false); // Close confirmation modal
    console.log("Report Info:", reportInfo);
    console.log("Checklist Data:", checklist);
    // Here you would typically send this data to your backend API

    setShowSuccessModal(true); // Show success modal
    // Optionally reset form after successful submission
    setReportInfo({
      projectName: projectNames[0],
      date: '',
      inspector: staticInspectorName,
    });
    setChecklist(initialChecklist);
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
              {projectNames.map(name => (
                <option key={name} value={name}>{name}</option>
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
                    {/* Using radio buttons to ensure only one selection per row */}
                    {['Yes', 'No', 'NA'].map(option => (
                      <label key={option} className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio" // Changed to radio for single selection enforcement
                          name={`item-${sectionIndex}-${itemIndex}`} // Unique name for radio group
                          value={option}
                          checked={item.response === option}
                          onChange={() => handleResponseChange(sectionIndex, itemIndex, option)}
                          className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded" // Tailwind for radio styling
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-6">
                <label htmlFor={`action-required-${sectionIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Action required, if any
                </label>
                <textarea
                  id={`action-required-${sectionIndex}`}
                  rows="3"
                  value={section.items[0].actionRequired} // Assuming actionRequired is consistent per section or only first item's is used for display
                  onChange={(e) => handleActionRequiredChange(sectionIndex, e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter any actions required for this section..."
                ></textarea>
              </div>
            </div>
          ))}

          {/* Submit Button */}
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

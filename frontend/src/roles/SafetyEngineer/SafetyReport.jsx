import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const WeeklySafetyStepper = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const projects = ['Project A', 'Project B', 'Project C'];

  const [selectedProject, setSelectedProject] = useState('');
  const [reportData, setReportData] = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(dayjs().format('dddd, MMMM D, HH:mm:ss A'));

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState({ activityIndex: null, imageIndex: null });

  // Load from localStorage on mount
  useEffect(() => {
    const today = dayjs().format('dddd');
    setActiveDay(today);
    setCurrentDayIndex(daysOfWeek.indexOf(today));

    const savedData = localStorage.getItem('weeklySafetyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setReportData(parsed.reportData || {});
      setSelectedProject(parsed.selectedProject || '');
    }

    const interval = setInterval(() => {
      setCurrentTime(dayjs().format('dddd, MMMM D, HH:mm:ss A'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save to localStorage on data change
  useEffect(() => {
    localStorage.setItem(
      'weeklySafetyData',
      JSON.stringify({ reportData, selectedProject })
    );
  }, [reportData, selectedProject]);

  const handleProjectSelect = (e) => {
    const project = e.target.value;
    setSelectedProject(project);
    // When project changes, set activeDay to currentDay
    const today = dayjs().format('dddd');
    setActiveDay(today);
  };

  const handleDayClick = (day, index) => {
    // Only allow changing the active day if it's the current actual day
    if (index === currentDayIndex) {
      setActiveDay(day);
    }
  };

  const handleActivityChange = (index, value) => {
    // Prevent changes if no project is selected or if it's not the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;

    const activities = [...(reportData[selectedProject]?.[activeDay] || [])];
    const existing = activities[index] || { text: '', images: [] };
    activities[index] = { ...existing, text: value };

    setReportData({
      ...reportData,
      [selectedProject]: {
        ...(reportData[selectedProject] || {}),
        [activeDay]: activities,
      },
    });
  };

  const handleImageChange = (index, files) => {
    // Prevent changes if no project is selected or if it's not the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;

    const activities = [...(reportData[selectedProject]?.[activeDay] || [])];
    const existing = activities[index] || { text: '', images: [] };
    const fileArray = Array.from(files);
    activities[index] = {
      ...existing,
      images: [...(existing.images || []), ...fileArray],
    };

    setReportData({
      ...reportData,
      [selectedProject]: {
        ...(reportData[selectedProject] || {}),
        [activeDay]: activities,
      },
    });
  };

  const removeImage = (activityIndex, imageIndex) => {
    // Prevent changes if no project is selected or if it's not the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;

    const updatedActivities = [...(reportData[selectedProject]?.[activeDay] || [])];
    const updatedImages = updatedActivities[activityIndex].images.filter((_, i) => i !== imageIndex);
    updatedActivities[activityIndex].images = updatedImages;

    setReportData({
      ...reportData,
      [selectedProject]: {
        ...(reportData[selectedProject] || {}),
        [activeDay]: updatedActivities,
      },
    });

    if (
      selectedImageIndex.activityIndex === activityIndex &&
      selectedImageIndex.imageIndex === imageIndex
    ) {
      setSelectedImage(null);
    }
  };

  const addActivity = () => {
    // Prevent adding if no project is selected or if it's not the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;

    const existingActivities = reportData[selectedProject]?.[activeDay] || [];
    const newActivities = [...existingActivities, { text: '', images: [] }];
    setReportData({
      ...reportData,
      [selectedProject]: {
        ...(reportData[selectedProject] || {}),
        [activeDay]: newActivities,
      },
    });
  };

  const confirmRemoveActivity = (index) => {
    // Prevent removal if no project is selected or if it's not the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;

    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const removeActivity = () => {
    // Prevent removal if no project is selected or if it's not the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;

    const updatedActivities = [...(reportData[selectedProject]?.[activeDay] || [])].filter((_, idx) => idx !== deleteIndex);
    setReportData({
      ...reportData,
      [selectedProject]: {
        ...(reportData[selectedProject] || {}),
        [activeDay]: updatedActivities,
      },
    });
    setShowDeleteModal(false);
    setShowDeleteSuccess(true);
  };

  const handleSubmit = () => {
    // Prevent submission if no project is selected or no valid input or if it's not the current day
    if (!selectedProject || !hasValidInput() || daysOfWeek.indexOf(activeDay) !== currentDayIndex) {
      alert("Please ensure a project is selected and all activity text fields for today are filled out.");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    const newData = { ...reportData };
    // For a "report submission" flow, you might want to mark it as submitted,
    // clear the current project's data, or move it to an "archived" state.
    // For now, I'll keep the deletion as per your original code.
    delete newData[selectedProject];

    setReportData(newData);
    setSelectedProject(''); // Clear selected project after submission
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    localStorage.setItem(
      'weeklySafetyData',
      JSON.stringify({ reportData: newData, selectedProject: '' }) // Update localStorage as well
    );
  };

  const hasValidInput = () => {
    // Check for valid input only if a project is selected and it's the current day
    if (!selectedProject || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return false;
    const activities = reportData[selectedProject]?.[activeDay] || [];

    // Ensure there's at least one activity and ALL activities have text
    if (activities.length === 0) return false;
    return activities.every((a) => a.text.trim() !== '');
  };

  return (
    <div className="p-6 bg-white rounded shadow-md relative w-[1200px] center">
      <div className="text-xl text-gray-600 mb-4 text-right font-bold">{currentTime}</div>

      <h2 className="text-2xl font-bold mb-4">Weekly Safety Report</h2>

      {/* Project Dropdown */}
      <div className="mb-6">
        <label htmlFor="project-select" className="block font-semibold mb-2 text-lg">Select a Project:</label>
        <select
          id="project-select"
          value={selectedProject}
          onChange={handleProjectSelect}
          className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a project --</option>
          {projects.map((proj, i) => (
            <option key={i} value={proj}>
              {proj}
            </option>
          ))}
        </select>
      </div>

      {/* Stepper */}
      <ol className="flex items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs sm:text-base sm:p-4 sm:space-x-4 rtl:space-x-reverse mb-6">
        {daysOfWeek.map((day, index) => {
          const isToday = index === currentDayIndex;
          const isActiveDay = day === activeDay;
          const dayHasData = selectedProject && reportData[selectedProject]?.[day] && reportData[selectedProject][day].some(a => a.text.trim() !== '' || a.images?.length > 0);

          return (
            <li
              key={day}
              // Only attach onClick if it's the current actual day
              onClick={isToday ? () => handleDayClick(day, index) : undefined}
              className={`flex items-center
                ${isActiveDay ? 'text-blue-600 font-bold' : 'text-gray-500'}
                ${isToday ? 'cursor-pointer hover:text-blue-500' : 'cursor-not-allowed opacity-50'}
                ${dayHasData && !isActiveDay ? 'text-green-600' : ''}`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 me-2 text-sm border rounded-full shrink-0
                  ${isActiveDay ? 'border-blue-600 bg-blue-100' : 'border-gray-400'}
                  ${dayHasData && !isActiveDay ? 'bg-green-100 border-green-600' : ''}
                `}
              >
                {index + 1}
              </span>
              {day}
              {index < daysOfWeek.length - 1 && (
                <svg
                  className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m7 9 4-4-4-4M1 9l4-4-4-4"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>

      {/* Activities Section */}
      <div className="mt-6">
        {selectedProject ? (
          <>
            <h3 className="font-semibold mb-4 text-xl">Activities for {activeDay} in {selectedProject}:</h3>

            {(reportData[selectedProject]?.[activeDay] || []).map((activity, index) => (
              <div key={index} className="mb-4 p-4 border rounded bg-gray-50 relative">
                {daysOfWeek.indexOf(activeDay) === currentDayIndex && (
                  <button
                    onClick={() => confirmRemoveActivity(index)}
                    className="absolute top-2 right-2 text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑️ Delete
                  </button>
                )}

                <label className="block mb-1 text-sm font-medium">Activity {index + 1} Details:</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 min-h-[100px]"
                  placeholder="Describe the activity"
                  value={activity.text}
                  onChange={(e) => handleActivityChange(index, e.target.value)}
                  disabled={daysOfWeek.indexOf(activeDay) !== currentDayIndex}
                />

                <label className="block mb-1 text-sm font-medium">Upload Images:</label>
                <div className="mb-2">
                  <label className={`inline-block cursor-pointer px-4 py-2 text-white rounded transition
                    ${daysOfWeek.indexOf(activeDay) === currentDayIndex ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}>
                    Choose Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange(index, e.target.files)}
                      disabled={daysOfWeek.indexOf(activeDay) !== currentDayIndex}
                      className="hidden"
                    />
                  </label>
                </div>

                {activity.images?.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {activity.images.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${imgIndex}`}
                          className="w-32 h-32 object-cover border rounded-lg cursor-pointer hover:scale-105 transition"
                          onClick={() => {
                            setSelectedImage(URL.createObjectURL(img));
                            setSelectedImageIndex({ activityIndex: index, imageIndex: imgIndex });
                          }}
                        />
                        <button
                          onClick={() => removeImage(index, imgIndex)}
                          className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {daysOfWeek.indexOf(activeDay) === currentDayIndex && (
              <>
                <button
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={addActivity}
                >
                  + Add Activity
                </button>
                <button
                  className={`mt-2 ml-4 px-4 py-2 rounded ${
                    hasValidInput()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleSubmit}
                  disabled={!hasValidInput()}
                >
                  Submit Report
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-8 p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-lg font-medium">Please select a project to view and manage activities.</p>
          </div>
        )}
      </div>

      {/* Modals (Confirm, Success, Delete, Image) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Submission</h2>
            <p className="mb-4">Are you sure you want to submit this report?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center w-80">
            <h2 className="text-lg font-semibold mb-2 text-green-600">Submitted Successfully!</h2>
            <p className="mb-4">Your report has been submitted.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center w-80">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Removal</h2>
            <p className="mb-4">Are you sure you want to remove this activity?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={removeActivity}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center w-80">
            <h2 className="text-lg font-semibold mb-2 text-green-600">Successfully Removed</h2>
            <p className="mb-4">The activity has been deleted.</p>
            <button
              onClick={() => setShowDeleteSuccess(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-4">
            <img
              src={selectedImage}
              alt="Selected"
              className="max-w-[80vw] max-h-[80vh] object-contain rounded"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
              title="Close"
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySafetyStepper;
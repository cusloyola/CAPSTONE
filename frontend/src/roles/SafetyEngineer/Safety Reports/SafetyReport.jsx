import React, { useState, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import AddSafetyReportModal from './AddSafetyReportModal';
import ConfirmationModal from './ConfirmationModal';
import DayNavigation from './DayNavigation'; // New component
import ActivityItem from './ActivityItem'; // New component
import ImageViewerModal from './ImageViewerModal'; // New component

const SafetyReport = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [currentActiveReport, setCurrentActiveReport] = useState(null);
  const [reportData, setReportData] = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(dayjs().format('dddd, MMMM D, HH:mm:ss A')); // Unused in JSX currently, could be removed if not needed elsewhere
  const [showModals, setShowModals] = useState({
    confirm: false,
    success: false,
    delete: false,
    deleteSuccess: false,
    addReportForm: false,
    selectedImage: null,
  });
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [selectedImageInfo, setSelectedImageInfo] = useState({ activityIndex: null, imageIndex: null });
  const [expandedActivities, setExpandedActivities] = useState({});
  const fileInputRefs = useRef({});

  const toggleModal = useCallback((modalName, value, extraInfo = null) => {
    setShowModals(prev => ({ ...prev, [modalName]: value }));
    if (modalName === 'selectedImage' && value) {
      setSelectedImageInfo(extraInfo);
    } else if (modalName === 'selectedImage' && !value) {
      setSelectedImageInfo({ activityIndex: null, imageIndex: null });
    }
  }, []);

  useEffect(() => {
    const today = dayjs().format('dddd');
    setActiveDay(today);
    setCurrentDayIndex(daysOfWeek.indexOf(today));

    const savedData = localStorage.getItem('weeklySafetyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setReportData(parsed.reportData || {});
      setCurrentActiveReport(parsed.currentActiveReport || null);
    }

    const interval = setInterval(() => {
      setCurrentTime(dayjs().format('dddd, MMMM D, HH:mm:ss A'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'weeklySafetyData',
      JSON.stringify({ reportData, currentActiveReport })
    );
  }, [reportData, currentActiveReport]);

  const updateReportData = useCallback((projectName, day, newActivities) => {
    setReportData(prevData => ({
      ...prevData,
      [projectName]: {
        ...(prevData[projectName] || {}),
        [day]: newActivities,
      },
    }));
  }, []);

  const handleActivityChange = useCallback((index, value) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const projectName = currentActiveReport.project_name;
    const activities = [...(reportData[projectName]?.[activeDay] || [])];
    const existing = activities[index] || { text: '', images: [] };
    activities[index] = { ...existing, text: value };
    updateReportData(projectName, activeDay, activities);
  }, [currentActiveReport, activeDay, currentDayIndex, reportData, updateReportData]);

  const handleImageChange = useCallback((index, files) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const projectName = currentActiveReport.project_name;
    const activities = [...(reportData[projectName]?.[activeDay] || [])];
    const existing = activities[index] || { text: '', images: [] };
    const fileArray = Array.from(files);
    activities[index] = {
      ...existing,
      images: [...(existing.images || []), ...fileArray],
    };
    updateReportData(projectName, activeDay, activities);
  }, [currentActiveReport, activeDay, currentDayIndex, reportData, updateReportData]);

  const removeImage = useCallback((activityIndex, imageIndex) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const projectName = currentActiveReport.project_name;
    const updatedActivities = [...(reportData[projectName]?.[activeDay] || [])];
    const updatedImages = updatedActivities[activityIndex].images.filter((_, i) => i !== imageIndex);
    updatedActivities[activityIndex].images = updatedImages;
    updateReportData(projectName, activeDay, updatedActivities);

    if (selectedImageInfo.activityIndex === activityIndex && selectedImageInfo.imageIndex === imageIndex) {
      toggleModal('selectedImage', false);
    }
  }, [currentActiveReport, activeDay, currentDayIndex, reportData, selectedImageInfo, toggleModal, updateReportData]);

  const addActivity = useCallback(() => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const projectName = currentActiveReport.project_name;
    const existingActivities = reportData[projectName]?.[activeDay] || [];
    const newActivities = [...existingActivities, { text: '', images: [] }];
    updateReportData(projectName, activeDay, newActivities);
    setExpandedActivities(prev => ({ ...prev, [newActivities.length - 1]: true }));
  }, [currentActiveReport, activeDay, currentDayIndex, reportData, updateReportData]);

  const confirmRemoveActivity = useCallback((index) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    setDeleteIndex(index);
    toggleModal('delete', true);
  }, [currentActiveReport, activeDay, currentDayIndex, toggleModal]);

  const removeActivity = useCallback(() => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const projectName = currentActiveReport.project_name;
    const updatedActivities = [...(reportData[projectName]?.[activeDay] || [])].filter((_, idx) => idx !== deleteIndex);
    updateReportData(projectName, activeDay, updatedActivities);

    toggleModal('delete', false);
    toggleModal('deleteSuccess', true);

    if (fileInputRefs.current[deleteIndex]) {
      delete fileInputRefs.current[deleteIndex];
    }
  }, [currentActiveReport, activeDay, currentDayIndex, deleteIndex, reportData, toggleModal, updateReportData]);

  const hasValidInput = useCallback(() => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return false;
    const activities = reportData[currentActiveReport.project_name]?.[activeDay] || [];
    return activities.length > 0 && activities.every((a) => a && a.text && a.text.trim() !== '');
  }, [currentActiveReport, activeDay, currentDayIndex, reportData]);

  const handleSubmit = useCallback(() => {
    if (!hasValidInput()) {
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center justify-center';
      messageBox.textContent = "Please ensure all activity text fields for today are filled out.";
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000);
      return;
    }
    toggleModal('confirm', true);
  }, [hasValidInput, toggleModal]);

  const confirmSubmit = useCallback(() => {
    setReportData(prevData => {
      const newData = { ...prevData };
      if (currentActiveReport && newData[currentActiveReport.project_name]) {
        delete newData[currentActiveReport.project_name];
      }
      return newData;
    });
    setCurrentActiveReport(null);
    toggleModal('confirm', false);
    toggleModal('success', true);
  }, [currentActiveReport, toggleModal]);

  const handleSaveNewReport = useCallback((newReport) => {
    setCurrentActiveReport(newReport);
    const reportDay = dayjs(newReport.report_date).format('dddd');
    setReportData(prevData => ({
      ...prevData,
      [newReport.project_name]: {
        ...(prevData[newReport.project_name] || {}),
        [reportDay]: newReport.activities
      }
    }));
    toggleModal('addReportForm', false);
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up';
    messageBox.textContent = `New Report for ${newReport.project_name} Created!`;
    document.body.appendChild(messageBox);
    setTimeout(() => document.body.removeChild(messageBox), 3000);
  }, [toggleModal]);

  const formattedWeekRange = `${dayjs().day(1).format('MMMM DD')} - ${dayjs().day(6).format('DD, YYYY')}`;

  if (showModals.addReportForm) {
    return <AddSafetyReportModal onClose={() => toggleModal('addReportForm', false)} onSaveNewReport={handleSaveNewReport} />;
  }

  return (
    <div className="p-6 bg-white rounded shadow-md relative w-full max-w-[1200px] mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 border-b-2 border-blue-500 pb-2">
        <h2 className="text-3xl font-extrabold text-gray-900 text-left">WEEKLY SAFETY REPORT</h2>
        <button
          onClick={() => toggleModal('addReportForm', true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          + ADD NEW WEEKLY REPORT
        </button>
      </div>
      <div className="flex flex-col items-center justify-center text-center mb-4">
        <div className="flex items-center space-x-4">
          <img src="/images/assets/drl_construction.png" alt="DRL Construction Logo" className="h-20 w-auto" />
        </div>
      </div>
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-gray-800">SAFETY REPORT</p>
        <p className="text-lg text-gray-600 font-semibold">{formattedWeekRange}</p>
      </div>

      {currentActiveReport ? (
        <>
          <div className="space-y-2 text-black text-xl mb-6">
            <p><strong>PROJECT NAME:</strong> {currentActiveReport.project_name}</p>
            <p><strong>AGENDA:</strong> {currentActiveReport.activities && currentActiveReport.activities.length > 0 ? currentActiveReport.activities[0].text : 'N/A'}</p>
            <p><strong>OWNER:</strong> {currentActiveReport.owner}</p>
            <p><strong>PROJECT MANAGER:</strong> {currentActiveReport.projectManager}</p>
            <p><strong>SAFETY ENGINEER:</strong> {currentActiveReport.safetyEngineer}</p>
          </div>

          <DayNavigation
            daysOfWeek={daysOfWeek}
            currentDayIndex={currentDayIndex}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            reportData={reportData}
            currentActiveReport={currentActiveReport}
          />

          <button
            className="w-full mt-6 mb-6 py-3 bg-blue-700 text-white rounded-lg shadow-lg font-bold text-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition duration-150 ease-in-out"
          >
            REPORT FOR {dayjs(currentActiveReport.report_date).format('MMMM D,YYYY - dddd').toUpperCase()}
          </button>

          <div className="w-full">
            <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-2">ACTIVITIES FOR {activeDay.toUpperCase()} IN {currentActiveReport.project_name.toUpperCase()}:</h3>
            {(reportData[currentActiveReport.project_name]?.[activeDay] || []).map((activity, index) => (
              <ActivityItem
                key={index}
                index={index}
                activity={activity}
                isCurrentDay={daysOfWeek.indexOf(activeDay) === currentDayIndex}
                handleActivityChange={handleActivityChange}
                handleImageChange={handleImageChange}
                removeImage={removeImage}
                confirmRemoveActivity={confirmRemoveActivity}
                toggleModal={toggleModal}
                fileInputRefs={fileInputRefs}
                expandedActivities={expandedActivities}
                setExpandedActivities={setExpandedActivities}
              />
            ))}
            {daysOfWeek.indexOf(activeDay) === currentDayIndex && (
              <button
                className="w-full mt-4 py-3 bg-gray-200 text-gray-800 rounded-lg shadow font-bold text-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out"
                onClick={addActivity}
              >
                ADD NEW ENTRY
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-8 p-4 border border-dashed border-gray-300 rounded-lg">
          <p className="text-lg font-medium">Please add a new report to view and manage activities.</p>
        </div>
      )}

      {currentActiveReport && (
        <div className="flex justify-end mt-8 space-x-4">
          <button
            className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out"
            onClick={() => { console.log("Save Draft clicked"); }}
          >
            SAVE DRAFT
          </button>
          <button
            className={`px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out
              ${hasValidInput() ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
            onClick={handleSubmit}
            disabled={!hasValidInput()}
          >
            SUBMIT REPORT
          </button>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={showModals.confirm}
        title="Confirm Submission"
        message="Are you sure you want to submit this report?"
        onConfirm={confirmSubmit}
        confirmText="Yes"
        onCancel={() => toggleModal('confirm', false)}
        cancelText="Cancel"
      />
      <ConfirmationModal
        isOpen={showModals.success}
        title="Submitted Successfully!"
        message="Your report has been submitted."
        onConfirm={() => toggleModal('success', false)}
        confirmText="Close"
        isSuccess={true}
      />
      <ConfirmationModal
        isOpen={showModals.delete}
        title="Confirm Removal"
        message="Are you sure you want to remove this activity?"
        onConfirm={removeActivity}
        confirmText="Yes, Remove"
        onCancel={() => toggleModal('delete', false)}
        cancelText="Cancel"
      />
      <ConfirmationModal
        isOpen={showModals.deleteSuccess}
        title="Successfully Removed"
        message="The activity has been deleted."
        onConfirm={() => toggleModal('deleteSuccess', false)}
        confirmText="Close"
        isSuccess={true}
      />
      {showModals.selectedImage && (
        <ImageViewerModal
          isOpen={showModals.selectedImage}
          onClose={() => toggleModal('selectedImage', false)}
          imageUrl={URL.createObjectURL(reportData[currentActiveReport.project_name][activeDay][selectedImageInfo.activityIndex].images[selectedImageInfo.imageIndex])}
        />
      )}
    </div>
  );
};

export default SafetyReport;
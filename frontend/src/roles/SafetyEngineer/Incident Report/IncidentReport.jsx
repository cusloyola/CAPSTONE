// IncidentReport.jsx (Concise version)
import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import AddIncidentReportModal from './AddIncidentReportModal'; // Import the modal

const IncidentReport = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [currentActiveReport, setCurrentActiveReport] = useState(null);
  const [reportData, setReportData] = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState({ activityIndex: null, imageIndex: null });
  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    const today = dayjs().format('dddd');
    setActiveDay(today);
    setCurrentDayIndex(daysOfWeek.indexOf(today));
    const savedData = localStorage.getItem('incidentReportData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setReportData(parsed.reportData || {});
      if (parsed.currentActiveReport) setCurrentActiveReport(parsed.currentActiveReport);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('incidentReportData', JSON.stringify({ reportData, currentActiveReport }));
  }, [reportData, currentActiveReport]);

  const handleDayClick = (day, index) => { if (index === currentDayIndex) setActiveDay(day); };
  const toggleAccordion = (index) => setExpandedActivities(prev => ({ ...prev, [index]: !prev[index] }));

  const handleActivityChange = (index, value) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const activities = [...(reportData[currentActiveReport.project_name]?.[activeDay] || [])];
    activities[index] = { ...(activities[index] || { text: '', images: [] }), text: value };
    setReportData({ ...reportData, [currentActiveReport.project_name]: { ...(reportData[currentActiveReport.project_name] || {}), [activeDay]: activities } });
  };

  const handleImageChange = (index, files) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const activities = [...(reportData[currentActiveReport.project_name]?.[activeDay] || [])];
    const existing = activities[index] || { text: '', images: [] };
    activities[index] = { ...existing, images: [...(existing.images || []), ...Array.from(files)] };
    setReportData({ ...reportData, [currentActiveReport.project_name]: { ...(reportData[currentActiveReport.project_name] || {}), [activeDay]: activities } });
  };

  const removeImage = (activityIndex, imageIndex) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const updatedActivities = [...(reportData[currentActiveReport.project_name]?.[activeDay] || [])];
    updatedActivities[activityIndex].images = updatedActivities[activityIndex].images.filter((_, i) => i !== imageIndex);
    setReportData({ ...reportData, [currentActiveReport.project_name]: { ...(reportData[currentActiveReport.project_name] || {}), [activeDay]: updatedActivities } });
    if (selectedImageIndex.activityIndex === activityIndex && selectedImageIndex.imageIndex === imageIndex) setSelectedImage(null);
  };

  const addActivity = () => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const newActivities = [...(reportData[currentActiveReport.project_name]?.[activeDay] || []), { text: '', images: [] }];
    setReportData({ ...reportData, [currentActiveReport.project_name]: { ...(reportData[currentActiveReport.project_name] || {}), [activeDay]: newActivities } });
    setExpandedActivities(prev => ({ ...prev, [newActivities.length - 1]: true }));
  };

  const confirmRemoveActivity = (index) => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    setDeleteIndex(index); setShowDeleteModal(true);
  };

  const removeActivity = () => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return;
    const updatedActivities = [...(reportData[currentActiveReport.project_name]?.[activeDay] || [])].filter((_, idx) => idx !== deleteIndex);
    setReportData({ ...reportData, [currentActiveReport.project_name]: { ...(reportData[currentActiveReport.project_name] || {}), [activeDay]: updatedActivities } });
    setShowDeleteModal(false); setShowDeleteSuccess(true);
    if (fileInputRefs.current[deleteIndex]) delete fileInputRefs.current[deleteIndex];
  };

  const handleSubmit = () => {
    if (!currentActiveReport || !hasValidInput() || daysOfWeek.indexOf(activeDay) !== currentDayIndex) {
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-x-0 bottom-6 mx-auto bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center justify-center w-fit';
      messageBox.textContent = "Please ensure all incident detail fields for today are filled out.";
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    const newData = { ...reportData };
    if (currentActiveReport && newData[currentActiveReport.project_name]) delete newData[currentActiveReport.project_name];
    setReportData(newData); setCurrentActiveReport(null);
    setShowConfirmModal(false); setShowSuccessModal(true);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); };
  const handleDrop = (index, e) => {
    e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleImageChange(index, e.dataTransfer.files);
  };

  const hasValidInput = () => {
    if (!currentActiveReport || daysOfWeek.indexOf(activeDay) !== currentDayIndex) return false;
    const activities = reportData[currentActiveReport.project_name]?.[activeDay] || [];
    return activities.length > 0 && activities.every(a => a && a.text && a.text.trim() !== '');
  };

  const handleSaveNewReport = (newReport) => {
    setCurrentActiveReport(newReport);
    const reportDay = dayjs(newReport.report_date).format('dddd');
    setReportData(prevData => ({ ...prevData, [newReport.project_name]: { ...(prevData[newReport.project_name] || {}), [reportDay]: newReport.activities } }));
    setShowAddReportForm(false);
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up';
    messageBox.textContent = `New Incident Report for ${newReport.project_name} Created!`;
    document.body.appendChild(messageBox);
    setTimeout(() => document.body.removeChild(messageBox), 3000);
  };

  const handleSaveDraft = () => {
    setReportData({ ...reportData });
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up';
    messageBox.textContent = "Draft Saved Successfully!";
    document.body.appendChild(messageBox);
    setTimeout(() => document.body.removeChild(messageBox), 3000);
  };

  const currentWeekStart = dayjs().day(1);
  const currentWeekEnd = dayjs().day(6);
  const formattedWeekRange = `${currentWeekStart.format('MMMM DD')} - ${currentWeekEnd.format('DD,YYYY')}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl relative w-full max-w-[1000px] mx-auto font-sans">
      {showAddReportForm && <AddIncidentReportModal onClose={() => setShowAddReportForm(false)} onSaveNewReport={handleSaveNewReport} />}
      {!showAddReportForm && (
        <>
          <div className="flex justify-between items-center mb-6 border-b-2 border-blue-500 pb-2">
            <h2 className="text-3xl font-extrabold text-gray-900 text-left">Incident Report</h2>
            <button onClick={() => setShowAddReportForm(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition duration-150 ease-in-out">+ Add New Report</button>
          </div>
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <div className="flex items-center space-x-4">
 <img
                src="/images/assets/drl_construction.png"
                alt="DRL Construction Logo"
                className="h-30 w-auto mt-6" // Adjust size as needed
              />            
            </div>
          </div>
        

          {currentActiveReport ? (
            <>
              <div className="space-y-2 text-gray-800 text-lg mb-6 mt-12">
                <p><strong>Project Name:</strong> <span className="font-semibold">{currentActiveReport.project_name}</span></p>
                <p><strong>Location:</strong> <span className="font-semibold">{currentActiveReport.activities && currentActiveReport.activities.length > 0 ? currentActiveReport.activities[0].text : 'N/A'}</span></p>
      <p><strong>Subject:</strong> <span className="font-semibold">{currentActiveReport.project_name}</span></p>
                <p><strong>Report Date:</strong> <span className="font-semibold">{currentActiveReport.activities && currentActiveReport.activities.length > 0 ? currentActiveReport.activities[0].text : 'N/A'}</span></p>

                {/* <p><strong>Incident Summary:</strong> <span className="font-semibold">{currentActiveReport.activities && currentActiveReport.activities.length > 0 ? currentActiveReport.activities[0].text : 'N/A'}</span></p> */}
                <p><strong>Owner:</strong> <span className="font-semibold">{currentActiveReport.owner}</span></p>
                <p><strong>Project Manager:</strong> <span className="font-semibold">{currentActiveReport.projectManager}</span></p>
                <p><strong>Safety Engineer:</strong> <span className="font-semibold">{currentActiveReport.safetyEngineer}</span></p>
              </div>

              {/* <ol className="flex justify-center items-center w-full p-4 space-x-4 text-lg sm:text-m font-semibold text-center text-gray-700 bg-white border border-gray-200 rounded-lg shadow mb-6 overflow-x-auto">
                {daysOfWeek.map((day, index) => {
                  const isToday = index === currentDayIndex;
                  const isActiveDay = day === activeDay;
                  const dayHasData = reportData[currentActiveReport.project_name]?.[day] && reportData[currentActiveReport.project_name][day].some(a => (a && a.text && a.text.trim() !== '') || (a.images && a.images.length > 0));
                  return (
                    <li key={day} onClick={isToday ? () => handleDayClick(day, index) : undefined} className={`flex items-center ${isActiveDay ? 'text-blue-600 font-bold' : 'text-gray-500'} ${isToday ? 'cursor-pointer hover:text-blue-500' : 'cursor-not-allowed opacity-50'} ${dayHasData && !isActiveDay ? 'text-green-600' : ''}`}>
                      <span className={`flex items-center justify-center h-10 px-6 border rounded-full uppercase ${isActiveDay ? 'border-blue-600 bg-blue-100' : 'border-gray-400'} ${dayHasData && !isActiveDay ? 'bg-green-100 border-green-600' : ''}`}>{day}</span>
                      {index < daysOfWeek.length - 1 && (<svg className="w-4 h-4 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" /></svg>)}
                    </li>
                  );
                })}
              </ol> */}

              <button className="w-full mt-6 mb-6 py-3 bg-blue-700 text-white rounded-lg shadow-lg font-bold text-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 transition duration-150 ease-in-out">REPORT FOR {dayjs(currentActiveReport.report_date).format('MMMM D,YYYY - dddd').toUpperCase()}</button>

              <div className="w-full">
                <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-2">INCIDENT DETAILS FOR {activeDay.toUpperCase()} IN {currentActiveReport.project_name.toUpperCase()}:</h3>
                {(reportData[currentActiveReport.project_name]?.[activeDay] || []).map((activity, index) => {
                  const isExpanded = expandedActivities[index];
                  return (
                    <div key={index} className="mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 shadow-sm">
                      <div className="flex justify-between items-center px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800 cursor-pointer" onClick={() => toggleAccordion(index)}>
                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">INCIDENT {index + 1} DETAILS<svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
                        {daysOfWeek.indexOf(activeDay) === currentDayIndex && (<button onClick={(e) => { e.stopPropagation(); confirmRemoveActivity(index); }} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600" title="Delete Incident"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 3a1 1 0 100 2v4a1 1 0 102 0v-4a1 1 0 00-2 0z" clipRule="evenodd"></path></svg></button>)}
                      </div>
                      {isExpanded && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                          <textarea id={`activity-details-${index}`} rows="4" className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Describe the incident..." value={activity.text} onChange={(e) => handleActivityChange(index, e.target.value)} disabled={daysOfWeek.indexOf(activeDay) !== currentDayIndex}></textarea>
                          <div className={`mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center ${daysOfWeek.indexOf(activeDay) === currentDayIndex ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-100'} hover:border-blue-500 hover:bg-blue-50 transition duration-200 ease-in-out`} onDragOver={daysOfWeek.indexOf(activeDay) === currentDayIndex ? handleDragOver : null} onDragLeave={daysOfWeek.indexOf(activeDay) === currentDayIndex ? handleDragLeave : null} onDrop={daysOfWeek.indexOf(activeDay) === currentDayIndex ? (e) => handleDrop(index, e) : null} onClick={() => daysOfWeek.indexOf(activeDay) === currentDayIndex && fileInputRefs.current[index]?.click()}>
                            <input type="file" accept="image/*" multiple onChange={(e) => handleImageChange(index, e.target.files)} disabled={daysOfWeek.indexOf(activeDay) !== currentDayIndex} className="hidden" ref={el => fileInputRefs.current[index] = el} />
                            <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L40 32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <p className="mt-2 text-base text-gray-600">DRAG IMAGES / CLICK TO UPLOAD</p>
                          </div>
                          {activity.images?.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
                              {activity.images.map((img, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <img src={URL.createObjectURL(img)} alt={`Preview ${imgIndex}`} className="w-60 h-60 object-cover border rounded-lg cursor-pointer hover:scale-105 transition" onClick={() => { setSelectedImage(URL.createObjectURL(img)); setSelectedImageIndex({ activityIndex: index, imageIndex: imgIndex }); }} />
                                  <button onClick={() => removeImage(index, imgIndex)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition" title="Remove Image">✖</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="w-full mt-4 py-3 bg-gray-200 text-gray-800 rounded-lg shadow font-bold text-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out" onClick={addActivity}>ADD NEW ENTRY</button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 mt-8 p-4 border border-dashed border-gray-300 rounded-lg">
              <p className="text-lg font-medium">Please add a new report to view and manage incidents.</p>
            </div>
          )}

          {currentActiveReport && (
            <div className="flex justify-end mt-8 space-x-4">
              <button className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out" onClick={handleSaveDraft}>SAVE DRAFT</button>
              <button className={`px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out ${hasValidInput() ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={handleSubmit} disabled={!hasValidInput()}>SUBMIT REPORT</button>
            </div>
          )}

          {showConfirmModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded shadow-md text-center w-80 font-sans"><h2 className="text-lg font-semibold mb-4">Confirm Submission</h2><p className="mb-4">Are you sure you want to submit this report?</p><div className="flex justify-center gap-4"><button onClick={confirmSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150 ease-in-out">Yes</button><button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-150 ease-in-out">Cancel</button></div></div></div>)}
          {showSuccessModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded shadow-md text-center w-80 font-sans"><h2 className="text-lg font-semibold mb-2 text-green-600">Submitted Successfully!</h2><p className="mb-4">Your report has been submitted.</p><button onClick={() => setShowSuccessModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out">Close</button></div></div>)}
          {showDeleteModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded shadow-md text-center w-80 font-sans"><h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Removal</h2><p className="mb-4">Are you sure you want to remove this incident detail?</p><div className="flex justify-center gap-4"><button onClick={removeActivity} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150 ease-in-out">Yes, Remove</button><button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-150 ease-in-out">Cancel</button></div></div></div>)}
          {showDeleteSuccess && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded shadow-md text-center w-80 font-sans"><h2 className="text-lg font-semibold mb-2 text-green-600">Successfully Removed</h2><p className="mb-4">The incident detail has been deleted.</p><button onClick={() => setShowDeleteSuccess(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out">Close</button></div></div>)}
          {selectedImage && (<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"><div className="relative bg-white rounded-lg shadow-lg p-4"><img src={selectedImage} alt="Selected" className="max-w-[80vw] max-h-[80vh] object-contain rounded" /><button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2" title="Close">❌</button></div></div>)}
        </>
      )}
    </div>
  );
};

export default IncidentReport;

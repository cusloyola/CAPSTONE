import React, { useState, useEffect } from "react";
import DateInput from "../SiteEngineer/DailyProgressReport/DateInput";
import ProjectSelector from "../SiteEngineer/DailyProgressReport/ProjectSelector";
import ActivitiesInput from "../SiteEngineer/DailyProgressReport/ActivitiesInput";
import WeatherInput from "../SiteEngineer/DailyProgressReport/WeatherInput";
import ManpowerInput from "../SiteEngineer/DailyProgressReport/ManpowerInput";
import EquipmentInput from "../SiteEngineer/DailyProgressReport/EquipmentInput";
import VisitorSelector from "../SiteEngineer/DailyProgressReport/VisitorSelector";
import RemarksInput from "../SiteEngineer/DailyProgressReport/RemarksInput";
import Modal from "../SiteEngineer/DailyProgressReport/Modal";


const SiteProgressTracking = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");
  const [activities, setActivities] = useState("");
  const [weatherAM, setWeatherAM] = useState("");
  const [weatherPM, setWeatherPM] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [newEquipment, setNewEquipment] = useState("");
  const [visitors, setVisitors] = useState("");
  const [remarks, setRemarks] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preparedBy, setPreparedBy] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [manpower, setManpower] = useState({});
  const [equipmentCounts, setEquipmentCounts] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/daily-site-report/projects");
        const data = await response.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          const firstProject = data.projects[0];
          setProjectName(firstProject.project_name);
          setProjectId(firstProject.project_id);
          setLocation(firstProject.location);
          setOwner(firstProject.owner);
          setPreparedBy(firstProject.prepared_by);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);


  useEffect(() => {
    const stored = {
      weatherAM: localStorage.getItem("weatherAM"),
      weatherPM: localStorage.getItem("weatherPM"),
      activities: localStorage.getItem("activities"),
      manpower: localStorage.getItem("manpower"),
      selectedEquipment: localStorage.getItem("selectedEquipment"),
      newEquipment: localStorage.getItem("newEquipment"),
    };
    if (stored.weatherAM) setWeatherAM(stored.weatherAM);
    if (stored.weatherPM) setWeatherPM(stored.weatherPM);
    if (stored.activities) setActivities(stored.activities);
    if (stored.manpower) setManpower(JSON.parse(stored.manpower));
    if (stored.selectedEquipment) setSelectedEquipment(JSON.parse(stored.selectedEquipment));
    if (stored.newEquipment) setNewEquipment(stored.newEquipment);
  }, []);


  useEffect(() => {
    localStorage.setItem("weatherAM", weatherAM);
    localStorage.setItem("weatherPM", weatherPM);
    localStorage.setItem("activities", activities);
    localStorage.setItem("manpower", JSON.stringify(manpower));
    localStorage.setItem("selectedEquipment", JSON.stringify(selectedEquipment));
    localStorage.setItem("newEquipment", newEquipment);
  }, [weatherAM, weatherPM, activities, manpower, selectedEquipment, newEquipment]);


  useEffect(() => {
    const valid = projectName && activities && weatherAM && weatherPM && validateManpower();
    setIsFormValid(valid);
  }, [projectName, activities, weatherAM, weatherPM, manpower]);


  const validateManpower = () => {
    return Object.values(manpower).some((count) => count > 0);
  };

 const Modal = ({ summaryData, onClose, onConfirm }) => {
  // Ensure summaryData is an array or set a fallback in case it's not
  if (!Array.isArray(summaryData)) {
    summaryData = []; // Set to an empty array if it's not
  }
};
  const handleProjectChange = (e) => {
    const selectedProjectName = e.target.value;
    setProjectName(selectedProjectName);
 
    const selectedProject = projects.find((p) => p.project_name === selectedProjectName);
   
    if (selectedProject) {
      setProjectId(selectedProject.project_id);
      setLocation(selectedProject.location);
      setOwner(selectedProject.owner);
      setPreparedBy(selectedProject.prepared_by);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!projectId) {
      console.error("❌ Project ID is not defined!");
      return;
    }
  
    const reportData = {
      date,
      projectId,
      activities,
      weatherAM,
      weatherPM,
      manpower,
      selectedEquipment: JSON.stringify(equipmentCounts),
      visitors,
      remarks,
      preparedBy,
    };
  
    // Log data before sending it to the backend
    console.log('Project ID:', projectId);
    console.log('Selected Equipment (before stringify):', selectedEquipment);  // Log selected equipment
    console.log('Manpower:', manpower);  // Log manpower data
    console.log('Report Data:', reportData);
  
    try {
      const response = await fetch('http://localhost:5000/api/daily-site-report/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from backend:", errorData);
        throw new Error('Failed to submit the report');
      }
  
      const result = await response.json();
      console.log("Response from backend:", result);  // Log the backend response
  
      // Open Modal after successful submission
      setSummaryData(result);
      setIsModalOpen(true);
  
    } catch (error) {
      console.error('❌ Error submitting report:', error);
    }
  };
  

  const handleButtonClick = (e) => {
    e.preventDefault(); // Prevent form submission
  };
  

  const handleConfirm = () => {
    alert("Report complete!");
    localStorage.clear();
    setDate(new Date().toISOString().split("T")[0]);
    setProjectName("");
    setLocation("");
    setOwner("");
    setActivities("");
    setWeatherAM("");
    setWeatherPM("");
    setVisitors("");
    setRemarks("");
    setSelectedEquipment([]);
    setNewEquipment("");
    setManpower(Object.keys(manpower).reduce((acc, role) => ({ ...acc, [role]: 0 }), {}));
    setSummaryData(null);
    setIsModalOpen(false);
  };


  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Site Progress Tracking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ProjectSelector projectName={projectName} onChange={handleProjectChange} projects={projects} />
          <DateInput date={date} onChange={(e) => setDate(e.target.value)} />
          </div>

        {isSubmitted && !projectName && (
          <span className="text-red-600">Project cannot be empty.</span>
        )}

        {projectName && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Location</label>
              <input type="text" value={location} readOnly className="w-full border p-2 rounded bg-gray-100" />
            </div>
            <div>
              <label className="block font-medium">Owner</label>
              <input type="text" value={owner} readOnly className="w-full border p-2 rounded bg-gray-100" />
            </div>
          </div>
        )}

        <WeatherInput
          weatherAM={weatherAM}
          weatherPM={weatherPM}
          onWeatherAMChange={(e) => setWeatherAM(e.target.value)}
          onWeatherPMChange={(e) => setWeatherPM(e.target.value)}
        />

        <ActivitiesInput activities={activities} onChange={(e) => setActivities(e.target.value)} />
        <div className="flex space-x-4">
        <ManpowerInput manpower={manpower} setManpower={setManpower} handleButtonClick={handleButtonClick} />
        <EquipmentInput
    selectedEquipment={selectedEquipment}
    onEquipmentChange={setSelectedEquipment}
    equipmentCounts={equipmentCounts}
    onEquipmentCountsChange={setEquipmentCounts}
    newEquipment={newEquipment}
    setNewEquipment={setNewEquipment}
    handleButtonClick={handleButtonClick}
/>
        </div>

        <label className="block font-medium">Select Visitors:</label>
        <VisitorSelector visitors={visitors} onChange={(e) => setVisitors(e.target.value)} />

        <RemarksInput remarks={remarks} onChange={(e) => setRemarks(e.target.value)} />

        <div>
          <label className="block font-medium">Prepared By</label>
          <input type="text" value={preparedBy} readOnly className="w-full border p-2 rounded bg-gray-100" />
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded text-white ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!isFormValid}
        >
          Submit Report
        </button>

        {isModalOpen && (
          <Modal summaryData={summaryData} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} />
        )}
      </form>
    </div>
  );
};

export default SiteProgressTracking;

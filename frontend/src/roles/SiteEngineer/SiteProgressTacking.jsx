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
  const [manpower, setManpower] = useState({
    "Site Engineer": 0,
    "Project Manager": 0,
    "Safety Engineer": 0,
    "Foreman": 0,
    "Inspector": 0,
    "Surveyor": 0,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/daily-site-report/projects");
        const data = await response.json();

        if (data.projects && data.projects.length > 0) {
          const first = data.projects[0];
          setProjects(data.projects);
          setProjectName(first.project_name);
          setLocation(first.location);
          setOwner(first.owner);
          setPreparedBy(first.prepared_by);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const validateManpower = () => {
    return Object.values(manpower).some((count) => count > 0);
  };

  // const toggleEquipment = (item) => {
  //   if (item === "Other") {
  //     if (selectedEquipment.includes("Other")) {
  //       setSelectedEquipment((prev) => prev.filter((eq) => eq !== "Other"));
  //       setNewEquipment("");
  //     } else {
  //       setSelectedEquipment((prev) => [...prev, "Other"]);
  //     }
  //   } else {
  //     setSelectedEquipment((prev) =>
  //       prev.includes(item)
  //         ? prev.filter((eq) => eq !== item)
  //         : [...prev, item]
  //     );
  //   }
  // };

  const handleProjectChange = (e) => {
    const selectedProjectName = e.target.value;
    setProjectName(selectedProjectName);

    const selected = projects.find(p => p.project_name === selectedProjectName);
    if (selected) {
      setLocation(selected.location);
      setOwner(selected.owner);
      setPreparedBy(selected.prepared_by);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!projectName || activities === "" || weatherAM === "" || weatherPM === "" || !validateManpower()) {
      setIsSubmitted(true);
      return;
    }

    const filteredManpower = Object.entries(manpower)
      .filter(([_, count]) => count > 0)
      .map(([role, count]) => `${role}: ${count}`)
      .join(", ");

    const equipmentText = [
      ...selectedEquipment.filter((eq) => eq !== "Other"),
      newEquipment.trim() ? newEquipment : null,
    ]
      .filter(Boolean)
      .join(", ") || "None";

    const summary = [
      ["Date", date],
      ["Project Name", projectName],
      ["Location", location],
      ["Owner", owner],
      ["Activities", activities],
      ["Weather AM", weatherAM],
      ["Weather PM", weatherPM],
      ["Manpower", filteredManpower],
      ["Selected Equipment", equipmentText],
      ["Visitors", visitors],
      ["Remarks", remarks],
      ["Prepared By", preparedBy],
    ];

    setSummaryData(summary);
    setIsModalOpen(true);

    const siteReportData = {
      date,
      projectName,
      location,
      owner,
      activities,
      weatherAM,
      weatherPM,
      manpower,
      selectedEquipment,
      newEquipment,
      visitors,
      remarks,
      preparedBy,
    };

    fetch("/api/daily-site-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteReportData),
    })
      .then((res) => res.json())
      .then((data) => console.log("Saved:", data))
      .catch((err) => console.error("Save error:", err));
  };

  const handleConfirm = () => {
    alert("Report complete!");
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
    setIsSubmitted(false);
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

        <div className="grid grid-cols-2 gap-4">
          <span className="text-red-600">
            {isSubmitted && weatherAM === "" && "Weather AM cannot be empty."}
          </span>
          <span className="text-red-600">
            {isSubmitted && weatherPM === "" && "Weather PM cannot be empty."}
          </span>
        </div>

        <ActivitiesInput activities={activities} onChange={(e) => setActivities(e.target.value)} />
        {isSubmitted && activities === "" && (
          <span className="text-red-600">Activities cannot be empty.</span>
        )}

        <div className="flex space-x-4">
          <ManpowerInput
            manpower={manpower}
            incrementManpower={(role, e) => {
              e.preventDefault();
              setManpower((prev) => ({ ...prev, [role]: prev[role] + 1 }));
            }}
            decrementManpower={(role, e) => {
              e.preventDefault();
              setManpower((prev) => ({ ...prev, [role]: Math.max(prev[role] - 1, 0) }));
            }}
          />

          <EquipmentInput
            selectedEquipment={selectedEquipment}
            // toggleEquipment={toggleEquipment}
            newEquipment={newEquipment}
            setNewEquipment={setNewEquipment}
          />
        </div>

        {isSubmitted && !validateManpower() && (
          <span className="text-red-600">At least one manpower role must be assigned.</span>
        )}

        <label className="block font-medium">Select Visitors:</label>
        <VisitorSelector visitors={visitors} onChange={(e) => setVisitors(e.target.value)} />

        <RemarksInput remarks={remarks} onChange={(e) => setRemarks(e.target.value)} />

        <div>
          <label className="block font-medium">Prepared By</label>
          <input type="text" value={preparedBy} readOnly className="w-full border p-2 rounded bg-gray-100" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
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

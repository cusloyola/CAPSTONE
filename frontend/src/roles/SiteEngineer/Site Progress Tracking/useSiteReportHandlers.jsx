import { useState, useEffect } from "react";

const useSiteReportHandlers = (onClose) => {

    const predefinedRoles = ["Site Engineer", "Foreman", "Laborer", "Safety Officer"];
    const predefinedEquipment = ["Excavator", "Concrete Mixer", "Crane", "Bulldozer"];


    const [formData, setFormData] = useState({
        project_name: "",
        report_date: new Date(),
        location: "",
        owner: "",
        weather_am: "",
        weather_pm: "",
        subject: "",
        notes: "",
        activities: "",
        visitors: "",
        prepared_by_user_id: "", 
        manpower: [{ role: "", count: "" }],
       selected_equipment: [{ name: "", quantity: "" }],
    });

    const [projectList, setProjectList] = useState([]);


    useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?.id;

  if (user_id) {
    setFormData((prev) => ({
      ...prev,
      prepared_by_user_id: user_id,
    }));
  }
}, []);


    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/projects");
                const data = await res.json();
                setProjectList(data);
            } catch (err) {
                console.error("Errr fetching project data: ", err);
            }
        };

        fetchProjects();
    }, []);


    const handleProjectSelect = (e) => {
        const selectedName = e.target.value;
        const selectedProject = projectList.find((p) => p.project_name === selectedName);

        setFormData((prev) => ({
            ...prev,
            project_name: selectedName,
              project_id: selectedProject.project_id,
            location: selectedProject.location || "",
            owner: selectedProject.client_name || "",
        }));

    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleManpowerChange = (index, field, value) => {
        const updated = [...formData.manpower];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, manpower: updated }));
    };

    const addManpowerRow = () => {
        setFormData((prev) => ({
            ...prev,
            manpower: [...prev.manpower, { role: "", count: "" }],
        }));
    };

    const removeManpowerRow = (index) => {
        const updated = [...formData.manpower];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, manpower: updated }));
    };

    const handleEquipmentChange = (index, field, value) => {
        const updated = [...formData.selected_equipment];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, selected_equipment: updated }));
    };

    const addEquipmentRow = () => {
        setFormData((prev) => ({
            ...prev,
            selected_equipment: [...prev.selected_equipment, { name: "", quantity: "" }],
        }));
    };

    const removeEquipmentRow = (index) => {
        const updated = [...formData.selected_equipment];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, selected_equipment: updated }));
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     console.log("Submitting report:", formData);
    //     // TODO: Send to backend
    //     onClose();
    // };

    const submitSiteReport = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/daily-site-report/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit report");
            }

            console.log("Report Submitted", data);

            onClose?.();

            return { success: true, data };
        } catch (error) {
            console.error("Failed to submit", error.message);
            return { success: false, error };
        }
    };


    return {
        formData,
        handleChange,
        handleProjectSelect,
        handleManpowerChange,
        addManpowerRow,
        removeManpowerRow,
        handleEquipmentChange,
        addEquipmentRow,
        removeEquipmentRow,
        submitSiteReport,
        predefinedRoles,
        predefinedEquipment,
        projectList
    };
};

export default useSiteReportHandlers;

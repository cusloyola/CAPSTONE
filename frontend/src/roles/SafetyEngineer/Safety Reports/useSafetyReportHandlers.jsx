import { useState, useEffect } from "react";

const useSafetyReportHandlers = (onClose) => {
  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    report_date: new Date(),
    description: "",
    image1: null,
    image2: null,
  });

  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null,
  });

  const [projectList, setProjectList] = useState([]);

  // Fetch projects dynamically
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects");
        const data = await res.json();
        setProjectList(data);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // Handle text/date changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle project selection
  const handleProjectSelect = (e) => {
    const selectedName = e.target.value;
    const selectedProject = projectList.find(
      (p) => p.project_name === selectedName
    );
    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        project_name: selectedProject.project_name,
        project_id: selectedProject.project_id,
      }));
    }
  };

  // Handle image uploads + previews
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreviewImages((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(files[0]),
      }));
    }
  };

  // Remove image
  const handleRemoveImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviewImages((prev) => ({ ...prev, [field]: null }));
  };

  // Submit to backend
  const submitSafetyReport = async () => {
    try {
      const payload = new FormData();
      payload.append("project_id", formData.project_id);
      payload.append("report_date", formData.report_date);
      payload.append("description", formData.description);

      if (formData.image1) payload.append("image1", formData.image1);
      if (formData.image2) payload.append("image2", formData.image2);

      const response = await fetch("http://localhost:5000/api/safetyReports", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit safety report");
      }

      console.log("✅ Safety Report submitted:", data);

      // ✅ send new report to parent
      onClose?.(true, data);

    } catch (err) {
      console.error("❌ Submit failed:", err.message);
    }
  };

  return {
    formData,
    previewImages,
    projectList,
    handleChange,
    handleProjectSelect,
    handleFileChange,
    handleRemoveImage,
    submitSafetyReport,
  };
};

export default useSafetyReportHandlers;

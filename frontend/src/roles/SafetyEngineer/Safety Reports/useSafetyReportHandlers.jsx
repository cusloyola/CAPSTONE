import { toast } from "react-toastify";
import { useState, useEffect } from "react";

const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const useSafetyReportHandlers = () => {
  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    report_date: today,
    description: "",
    status: "",
    image1: null,
    image2: null,
    user_id: "",
  });

  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null,
  });

  const [projectList, setProjectList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch projects once
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects/inProgress");
        const data = await res.json();
        setProjectList(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        toast.error("Unable to load projects");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Load user_id from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      setFormData((prev) => ({ ...prev, user_id: storedUser.id }));
    } else {
      console.warn("⚠️ No user_id found in localStorage:", storedUser);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle project selection
  const handleProjectSelect = (e) => {
    const selectedId = e.target.value;
    const project = projectList.find((p) => p.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      project_id: selectedId,
      project_name: project ? project.project_name : "",
    }));
  };

  // Handle file uploads
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

  // Remove uploaded image
  const handleRemoveImage = (key) => {
    setFormData((prev) => ({ ...prev, [key]: null }));
    setPreviewImages((prev) => ({ ...prev, [key]: null }));
  };

  // Submit handler
  const submitSafetyReport = async (payload) => {
    try {
      const formPayload = new FormData();

      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null) {
          if (key === "report_date") {
            const date = new Date(payload[key]);
            const formattedDate = date.toISOString().split("T")[0];
            formPayload.append(key, formattedDate);
          } else {
            formPayload.append(key, payload[key]);
          }
        }
      });

      const res = await fetch("http://localhost:5000/api/safetyReports", {
        method: "POST",
        body: formPayload,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Safety report submitted successfully!");
        return data;
      } else {
        toast.error(data.error || "Failed to submit report.");
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting report.");
      return null;
    }
  };

  // ------------------------
// Update Existing Safety Report
// ------------------------
const submitSafetyReportUpdate = async (payload) => {
  try {
    const formPayload = new FormData();

    Object.keys(payload).forEach((key) => {
      if (payload[key] !== null && payload[key] !== undefined) {
        if (key === "report_date") {
          const date = new Date(payload[key]);
          const formattedDate = date.toISOString().split("T")[0];
          formPayload.append(key, formattedDate);
        } else {
          formPayload.append(key, payload[key]);
        }
      }
    });

    const res = await fetch(
      `http://localhost:5000/api/safetyReports/${payload.safety_report_id}`,
      {
        method: "PUT", // Ensure your backend supports PUT for updates
        body: formPayload,
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success("Safety report updated successfully!");
      return data;
    } else {
      toast.error(data.error || "Failed to update report.");
      return null;
    }
  } catch (err) {
    console.error(err);
    toast.error("Error updating report.");
    return null;
  }
};


  return {
    formData,
    setFormData,
    previewImages,
    setPreviewImages,
    projectList,
    loadingProjects,
    handleChange,
    handleProjectSelect,
    handleFileChange,
    handleRemoveImage,
    submitSafetyReport,
    submitSafetyReportUpdate
  };
};

export default useSafetyReportHandlers;

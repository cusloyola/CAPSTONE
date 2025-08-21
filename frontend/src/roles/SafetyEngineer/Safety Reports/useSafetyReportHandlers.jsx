import { toast } from "react-toastify";
import { useState, useEffect } from "react";

const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const useSafetyReportHandlers = (callback) => {
  const [formData, setFormData] = useState({
    project_id: "",     // use project_id instead of project_name since backend expects this
    report_date: today, // <-- Set to current date
    description: "",
    image1: null,
    image2: null,
    user_id: ""         // <-- add this

  });
  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null,
  });
  const [projectList, setProjectList] = useState([]);

  // Load projects once (you can also move to parent if needed)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects");
        const data = await res.json();
        setProjectList(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        toast.error("Unable to load projects");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {   // 👈 change this to match your real key
      setFormData((prev) => ({ ...prev, user_id: storedUser.id }));
    } else {
      console.warn("⚠️ No user_id found in localStorage object:", storedUser);
    }
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectSelect = (e) => {
    setFormData((prev) => ({ ...prev, project_id: e.target.value }));
  };

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
        return data; // ✅ return inserted data
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

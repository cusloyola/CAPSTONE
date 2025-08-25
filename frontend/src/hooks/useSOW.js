import { useState, useEffect } from "react";
import { fetchWorkDetails } from "../api/sowApi";

export const useWorkDetails = (isOpen, projectId) => {
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchWorkDetails(projectId);
        setWorkItems(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, projectId]);

  return { workItems, loading, error };
};

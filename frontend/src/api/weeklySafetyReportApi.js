import { API_URL } from "./api";


 // Load all reports
  export const loadReports = async () => {
    try {
      const res = await fetch(`${API_URL}/safetyReports`);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load safety reports", err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);
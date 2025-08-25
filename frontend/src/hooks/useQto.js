// hooks/useQTO.js
import { useState, useEffect } from "react";
import { fetchQTOByProject } from "../api/qtoApi";

export const useQTO = (isOpen, projectId, task) => {
  const [qtoList, setQtoList] = useState([]);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchQTOByProject(projectId);
        setQtoList(data);

        // default rows setup
        if (!task?.table || task.table.length === 0) {
          let quantity = 0;
          if (task?.isReinforcement) {
            quantity = task.rebar_overall_weight || 0;
          } else {
            const match = data.find((q) => Number(q.work_item_id) === Number(task?.work_item_id));
            quantity = match ? match.total || 0 : 0;
          }
          setRows([{ id: Date.now(), quantity, rate: 0 }]);
        } else {
          setRows(task.table);
        }
      } catch (err) {
        setFetchError("Failed to load QTO data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, projectId, task]);

  return { qtoList, rows, setRows, isLoading, fetchError };
};

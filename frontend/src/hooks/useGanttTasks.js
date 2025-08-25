import { useState, useEffect } from "react";
import { fetchGanttTasks } from "../api/ganttChartApi";

export const useGanttTasks = (project_id) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!project_id) return;
    const getTasks = async () => {
      const data = await fetchGanttTasks(project_id);
      setTasks(data);
    };
    getTasks();
  }, [project_id]);

  return [tasks, setTasks];
};


export const useGanttTimeline = (projectStart, projectEnd) => {
  const [months, setMonths] = useState([]);
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    const start = new Date(projectStart);
    const end = new Date(projectEnd);
    const monthsArr = [];
    const weeksArr = [];
    let weekCounter = 1;
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      const monthName = current.toLocaleString("default", { month: "long", year: "numeric" });
      monthsArr.push({ name: monthName, weeks: 4 });

      for (let i = 0; i < 4; i++) {
        weeksArr.push({ label: `W${weekCounter}`, month: monthName, weekIndex: weekCounter });
        weekCounter++;
      }

      current.setMonth(current.getMonth() + 1);
    }

    setMonths(monthsArr);
    setWeeks(weeksArr);
  }, [projectStart, projectEnd]);

  return { months, weeks, setWeeks };
};










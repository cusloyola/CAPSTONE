import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SetDuratioModal from "./SetDurationModal";
import SetWeekDuration from "./SetWeekDurationModal";

const GanttTable = () => {
  const { project_id } = useParams(); 

  const [projectStart] = useState("2025-06-01");
  const [projectEnd] = useState("2025-10-08");

  const [selectedTaskId, setSelectedTaskId] = useState(null);
const [isSetDurationOpen, setIsSetDurationOpen] = useState(false);


  const [isDurationOpen, setIsDurationOpen] = useState(false);

  
  const [isWeekDurationOpen, setIsWeekDurationOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [months, setMonths] = useState([]);
  const [weeks, setWeeks] = useState([]);

  // Generate months and weeks
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

   // Fetch tasks dynamically using only projectId
  useEffect(() => {
    if (!project_id) {
      console.warn("⚠️ No projectId available yet");
      return;
    }


    const fetchTasks = async () => {
      try {
        console.log("🌐 Fetching tasks for projectId:", project_id);
        const res = await fetch(
          `http://localhost:5000/api/gantt-chart/work-details?project_id=${project_id}`
        );


        if (!res.ok) {
          console.error("❌ Failed fetch, status:", res.status);
          return;
        }


        const data = await res.json();
        console.log("📦 Tasks fetched from API:", data);


        if (Array.isArray(data)) {
          const mappedTasks = data.map((item, index) => ({
            itemNo: index + 1,
            description: item.item_title,
            amount: Number(item.amount) || 0,
            startWeek: 1,
            finishWeek: 4,
            duration: 4,
            color: "bg-blue-500",
            completedWeeks: [],
          }));
          console.log("📝 Mapped tasks:", mappedTasks);
          setTasks(mappedTasks);
        } else {
          console.error("❌ API did not return an array:", data);
        }
      } catch (err) {
        console.error("🔥 Error fetching work details:", err);
      }
    };


    fetchTasks();
  }, [project_id]);



  const totalAmount = tasks.reduce((sum, t) => sum + t.amount, 0);

  const weeklyTotals = weeks.map((w) =>
    tasks.reduce((sum, t) => {
      const wt = (t.amount / totalAmount) * 100 || 0;
      if (w.weekIndex >= t.startWeek && w.weekIndex <= t.finishWeek) return sum + wt / t.duration;
      return sum;
    }, 0)
  );

  const handleToggleWeek = (itemNo, weekIndex) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.itemNo === itemNo) {
          let completedWeeks = [...task.completedWeeks];
          completedWeeks.includes(weekIndex)
            ? (completedWeeks = completedWeeks.filter((w) => w !== weekIndex))
            : completedWeeks.push(weekIndex);
          return { ...task, completedWeeks };
        }
        return task;
      })
    );
  };

  return (
    <div className="overflow-x-auto p-6 relative">
      <div className="flex justify-end gap-2 mb-2">
        <button
          className="text-white px-4 py-2 rounded bg-blue-600 hover:bg-blue-900"
          onClick={() => setIsDurationOpen(true)}
        >
          Set Duration
        </button>
        <button
          className="text-white px-4 py-2 rounded bg-green-600 hover:bg-green-900"
          onClick={() => setIsWeekDurationOpen(true)}
        >
          Set Week Duration
        </button>
      </div>

      <table className="min-w-max table-fixed border-collapse border border-gray-300">
        <thead>
          <tr>
            <th colSpan={7} className="border bg-gray-100 px-2 py-1">
              Activity Info
            </th>
            {months.map((month) => (
              <th key={month.name} colSpan={month.weeks} className="border px-2 py-1">
                {month.name}
              </th>
            ))}
          </tr>
          <tr>
            <th className="border bg-gray-100 px-2 py-1 w-12">Item No</th>
            <th className="border bg-gray-100 px-2 py-1 w-72">Description</th>
            <th className="border bg-gray-100 px-2 py-1 w-28">Amount</th>
            <th className="border bg-gray-100 px-2 py-1 w-20">Wt%</th>
            <th className="border bg-gray-100 px-2 py-1 w-20">Start</th>
            <th className="border bg-gray-100 px-2 py-1 w-20">Finish</th>
            <th className="border bg-gray-100 px-2 py-1 w-28">Duration</th>
            {weeks.map((w) => (
              <th key={w.weekIndex} className="border bg-gray-100 px-2 py-1 w-16">
                {w.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
  {/* 1️⃣ Zero-amount tasks first */}
  {tasks
    .filter((t) => t.amount === 0)
    .map((task, idx) => (
      <tr key={`empty-${idx}`} className="bg-gray-50">
        <td className="border px-2 py-1">&nbsp;</td>
        <td className="border px-2 py-1 text-left">{task.description}</td>
        <td className="border px-2 py-1">&nbsp;</td>
        <td className="border px-2 py-1">&nbsp;</td>
        <td className="border px-2 py-1">&nbsp;</td>
        <td className="border px-2 py-1">&nbsp;</td>
        <td className="border px-2 py-1">&nbsp;</td>
        {weeks.map((w, i) => (
          <td key={i} className="border px-2 py-1">&nbsp;</td>
        ))}
      </tr>
    ))}

  {/* 2️⃣ Non-zero amount tasks */}
  {tasks
    .filter((t) => t.amount > 0)
    .map((task, idx) => {
      const weightPercent = ((task.amount / totalAmount) * 100).toFixed(1);
      const perWeek = ((task.amount / totalAmount) * 100) / task.duration;

      return (
        <tr key={task.itemNo}>
          <td className="border px-2 py-1 text-center">{idx + 1}</td>
          <td className="border px-2 py-1 text-left">{task.description}</td>
          <td className="border px-2 py-1 text-right">{task.amount.toLocaleString()}</td>
          <td className="border px-2 py-1 text-center">{weightPercent}%</td>
          <td className="border px-2 py-1 text-center">W{task.startWeek}</td>
          <td className="border px-2 py-1 text-center">W{task.finishWeek}</td>
          <td className="border px-2 py-1 text-center">{task.duration} wks</td>
          {weeks.map((w) => {
            const isActive = w.weekIndex >= task.startWeek && w.weekIndex <= task.finishWeek;
            return (
              <td
                key={w.weekIndex}
                className={`border px-2 py-1 text-center ${isActive ? `${task.color} font-bold` : ""}`}
                onClick={() => handleToggleWeek(task.itemNo, w.weekIndex)}
              >
                {isActive ? `${perWeek.toFixed(1)}%` : ""}
              </td>
            );
          })}
        </tr>
      );
    })}

  {/* 3️⃣ Total row at the bottom */}
  <tr className="bg-gray-200 font-bold">
    <td colSpan={2} className="border px-2 py-1 text-right">Total</td>
    <td className="border px-2 py-1 text-right">{totalAmount.toLocaleString()}</td>
    <td className="border px-2 py-1 text-center">100%</td>
    <td className="border px-2 py-1"></td>
    <td className="border px-2 py-1"></td>
    <td className="border px-2 py-1 text-center">
      {tasks.filter(t => t.amount > 0).reduce((sum, t) => sum + t.duration, 0)} wks
    </td>
    {weeks.map((w, idx) => {
      const weeklyTotal = tasks
        .filter(t => t.amount > 0)
        .reduce((sum, t) => {
          const wt = (t.amount / totalAmount) * 100;
          return w.weekIndex >= t.startWeek && w.weekIndex <= t.finishWeek ? sum + wt / t.duration : sum;
        }, 0);
      return (
        <td key={idx} className="border px-2 py-1 text-center">{weeklyTotal.toFixed(1)}%</td>
      );
    })}
  </tr>
</tbody>

      </table>

      <SetDuratioModal isOpen={isDurationOpen} onClose={() => setIsDurationOpen(false)} tasks={tasks} setTasks={setTasks} project_id={project_id}/>
      <SetWeekDuration isOpen={isWeekDurationOpen} onClose={() => setIsWeekDurationOpen(false)} weeks={weeks} setWeeks={setWeeks} />
    </div>
  );
};

export default GanttTable;  


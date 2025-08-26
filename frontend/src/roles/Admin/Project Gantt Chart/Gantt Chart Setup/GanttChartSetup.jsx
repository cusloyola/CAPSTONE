import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SetDuratioModal from "./SetDurationModal";
import SetWeekDuration from "./SetWeekDurationModal";
import { fetchGanttTasks } from "../../../../api/ganttChartApi";


import { calculateTotalAmount, calculateWeeklyTotals, mapApiTasks } from "../../../../utils/ganttHelpers";
import { useGanttTasks, useGanttTimeline } from "../../../../hooks/useGanttTasks";
import { fetchProjectInfo } from "../../../../api/projectApi";

const GanttTable = () => {
  const { project_id, gantt_chart_id } = useParams();
  const [project, setProject] = useState(null);

  const [isDurationOpen, setIsDurationOpen] = useState(false);

  const [isWeekDurationOpen, setIsWeekDurationOpen] = useState(false);

  const [tasks, setTasks] = useGanttTasks(project_id);
  const { months, weeks, setWeeks } = useGanttTimeline(project?.start_date, project?.end_date);


  const totalAmount = calculateTotalAmount(tasks);
  const weeklyTotals = calculateWeeklyTotals(tasks, weeks);


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


  useEffect(() => {
    const loadProject = async () => {
      const data = await fetchProjectInfo(project_id);
      setProject(data);
    };
    loadProject();
  }, [project_id]);


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
                  <td className="border px-2 py-1 text-center">
                    {task.duration != null ? `${Math.round(task.duration)} wks` : ""}
                  </td>
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

      <SetDuratioModal
        isOpen={isDurationOpen}
        onClose={() => setIsDurationOpen(false)}
        tasks={tasks}
        setTasks={setTasks}
        gantt_chart_id={gantt_chart_id}
        project_id={project_id}
      />
      <SetWeekDuration isOpen={isWeekDurationOpen} onClose={() => setIsWeekDurationOpen(false)} weeks={weeks} setWeeks={setWeeks} />
    </div>
  );
};

export default GanttTable;


import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SetDurationModal from "./SetDurationModal";
import { fetchGanttTasks } from "../../../../api/ganttChartApi";


import { calculateTotalAmount, calculateWeeklyTotals, mapApiTasks } from "../../../../utils/ganttHelpers";
import { useGanttTasks, useGanttTimeline } from "../../../../hooks/useGanttTasks";
import { fetchProjectInfo } from "../../../../api/projectApi";

const GanttTable = () => {
  const { project_id, gantt_chart_id } = useParams();
  const [project, setProject] = useState(null);


  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [computeMode, setComputeMode] = useState(null);

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

  // Helper for pastel colors
  const generatePastelColor = (index) => {
    const hue = (index * 137.5) % 360; // golden angle for distinct hues
    return `hsl(${hue}, 70%, 85%)`; // light pastel
  };

  // In your render, map tasks and attach color
  const coloredTasks = tasks.map((task, idx) => ({
    ...task,
    color: generatePastelColor(idx),
  }));



  useEffect(() => {
    const loadProject = async () => {
      const data = await fetchProjectInfo(project_id);
      setProject(data);
    };
    loadProject();
  }, [project_id]);


  return (
    <div className="overflow-x-auto p-6 relative">

      <div className="flex justify-between items-center mt-6 mb-6">
        <p className="text-2xl font-semibold">Weekly Progress Template</p>
        <div className="flex items-center space-x-2">

          <button
            className="text-white px-4 py-2 rounded bg-blue-600 hover:bg-blue-900"
            onClick={() => {
              setComputeMode("duration");
              setIsSelectOpen(true);
            }}
          >
            Set Duration
          </button>
          <button
            className="text-white px-4 py-2 rounded bg-green-600 hover:bg-green-900"
            onClick={() => {
              setComputeMode("week");
              setIsSelectOpen(true);
            }}
          >
            Set Week Duration
          </button>
        </div>
      </div>

      <hr />

      <div class="flex flex-wrap gap-4 mt-10">
        <div class="flex flex-col gap-2 mt-6">
          <select class="border p-2 rounded w-48">
            <option value="">All Categories</option>
            <option value="Category1">Category1</option>
            <option value="Category2">Category2</option>
            <option value="Category3">Category3</option>
          </select>
        </div>
        <div class="flex flex-col gap-2 mt-6">
          <select class="border p-2 rounded w-48">
            <option value="">All Units</option>
            <option value="Unit1">Unit1</option>
            <option value="Unit2">Unit2</option>
            <option value="Unit3">Unit3</option>
          </select>
        </div>
      </div>

      <div class="flex justify-between items-center mt-6 mb-6">
        <div>
          <label class="text-sm">
            Show
            <select class="mx-2 border p-1 rounded w-14 mt-2">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            entries
          </label>
        </div>
        <div class="flex items-center gap-2">
          <input
            placeholder="Search Work List..."
            type="text"
            class="border p-2 rounded w-64"
          />
        </div>
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
          {coloredTasks
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
                    {task.duration != null ? `${Math.ceil(task.duration)} wks` : ""}
                  </td>

                  {weeks.map((w) => {
                    const isActive = w.weekIndex >= task.startWeek && w.weekIndex <= task.finishWeek;
                    return (
                      <td
                        key={w.weekIndex}
                        className="border px-2 py-1 text-center font-bold"
                        style={{ backgroundColor: isActive ? task.color : undefined }}
                      >
                        {isActive ? `${perWeek.toFixed(3)}%` : ""}
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

      <div class="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
        <p>Showing 1 to 10 of 25 entries</p>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button class="px-3 py-1 border rounded disabled:opacity-50">
            Previous
          </button>
          <button class="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      <SetDurationModal
        isOpen={isSelectOpen}
        onClose={() => setIsSelectOpen(false)}
        tasks={tasks}
        setTasks={setTasks}
        project_id={project_id}
        gantt_chart_id={gantt_chart_id}
        computeType={computeMode}
      />


      {/* <SetWeekDuration isOpen={isWeekDurationOpen} onClose={() => setIsWeekDurationOpen(false)} weeks={weeks} setWeeks={setWeeks} /> */}
    </div>
  );
};

export default GanttTable;


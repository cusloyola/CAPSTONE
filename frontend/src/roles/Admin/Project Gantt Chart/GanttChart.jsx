import React, { useState, useEffect } from "react";

const GanttTable = () => {
  const [projectStart] = useState("2025-06-01");
  const [projectEnd] = useState("2025-10-08");

  const [tasks, setTasks] = useState([
    {
      itemNo: 1,
      description: "Excavation",
      amount: 50000,
      startWeek: 2,
      finishWeek: 5,
      duration: 4,
      color: "bg-blue-500",
      completedWeeks: [2, 3],
    },
    {
      itemNo: 2,
      description: "Foundation",
      amount: 40000,
      startWeek: 3,
      finishWeek: 8,
      duration: 6,
      color: "bg-green-500",
      completedWeeks: [3, 4],
    },
    {
      itemNo: 3,
      description: "Concrete",
      amount: 30000,
      startWeek: 6,
      finishWeek: 10,
      duration: 5,
      color: "bg-orange-500",
      completedWeeks: [],
    },
  ]);

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

  const handleToggleWeek = (itemNo, weekIndex) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.itemNo === itemNo) {
          let completedWeeks = [...task.completedWeeks];
          if (completedWeeks.includes(weekIndex)) {
            completedWeeks = completedWeeks.filter((w) => w !== weekIndex);
          } else {
            completedWeeks.push(weekIndex);
          }
          return { ...task, completedWeeks };
        }
        return task;
      })
    );
  };

  const totalAmount = tasks.reduce((sum, t) => sum + t.amount, 0);

  const weeklyTotals = weeks.map((w) =>
    tasks.reduce((sum, t) => {
      const wt = (t.amount / totalAmount) * 100;
      if (w.weekIndex >= t.startWeek && w.weekIndex <= t.finishWeek) {
        return sum + wt / t.duration;
      }
      return sum;
    }, 0)
  );

  const weeklyActualTotals = weeks.map((w) =>
    tasks.reduce((sum, t) => {
      const wt = (t.amount / totalAmount) * 100;
      if (w.weekIndex >= t.startWeek && w.weekIndex <= t.finishWeek && t.completedWeeks.includes(w.weekIndex)) {
        return sum + wt / t.duration;
      }
      return sum;
    }, 0)
  );

  const cumulative = weeklyTotals.reduce((acc, val, i) => {
    acc.push((acc[i - 1] || 0) + val);
    return acc;
  }, []);

  const actualCumulative = weeklyActualTotals.reduce((acc, val, i) => {
    acc.push((acc[i - 1] || 0) + val);
    return acc;
  }, []);

  const footerTasks = [
    { description: "Weekly Progress Total (%)", values: weeklyTotals, bg: "bg-gray-100" },
    { description: "Cumulative Progress (%)", values: cumulative, bg: "bg-green-100" },
    { description: "Weekly Actual Progress (%)", values: weeklyActualTotals, bg: "bg-gray-100" },
    { description: "Actual Cumulative Progress (%)", values: actualCumulative, bg: "bg-orange-100" },
  ];

  return (
   <div className="overflow-x-auto p-6 relative">
      {/* Buttons at top-right */}
      <div className="flex justify-end mb-2 gap-2">
        <button className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Set Duration
        </button>
        <button className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">
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
          {tasks.map((task) => {
            const weightPercent = ((task.amount / totalAmount) * 100).toFixed(1);
            const perWeek = (task.amount / totalAmount * 100) / task.duration;

            return (
              <tr key={task.itemNo}>
                <td className="border px-2 py-1 text-center">{task.itemNo}</td>
                <td className="border px-2 py-1 text-left">{task.description}</td>
                <td className="border px-2 py-1 text-right">{task.amount.toLocaleString()}</td>
                <td className="border px-2 py-1 text-center">{weightPercent}%</td>
                <td className="border px-2 py-1 text-center">W{task.startWeek}</td>
                <td className="border px-2 py-1 text-center">W{task.finishWeek}</td>
                <td className="border px-2 py-1 text-center">{task.duration} wks</td>
                {weeks.map((w) => {
                  const isActive = w.weekIndex >= task.startWeek && w.weekIndex <= task.finishWeek;
                  const isDone = task.completedWeeks.includes(w.weekIndex);
                  return (
                    <td
                      key={w.weekIndex}
                      className={`border px-2 py-1 text-center cursor-pointer ${
                        isActive ? `${task.color} font-bold ${isDone ? "text-black" : "text-red-600"}` : ""
                      }`}
                      onClick={() => isActive && handleToggleWeek(task.itemNo, w.weekIndex)}
                    >
                      {isActive ? `${perWeek.toFixed(1)}%` : ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* TOTAL Row above footer */}
          <tr className="font-bold bg-gray-200">
            <td className="border px-2 py-1 text-center"></td>
            <td className="border px-2 py-1 text-left">TOTAL</td>
            <td className="border px-2 py-1 text-right">{totalAmount.toLocaleString()}</td>
            <td className="border px-2 py-1 text-center">100%</td>
            <td className="border px-2 py-1 text-center"></td>
            <td className="border px-2 py-1 text-center"></td>
            <td className="border px-2 py-1 text-center">
              {tasks.reduce((sum, t) => sum + t.duration, 0)} wks
            </td>
            {weeks.map((w) => (
              <td key={w.weekIndex} className="border px-2 py-1"></td>
            ))}
          </tr>

          {/* Footer rows */}
          {footerTasks.map((footer, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1"></td>
              <td className={`border px-2 py-1 font-bold ${footer.bg || ""}`}>{footer.description}</td>
              <td className={`border px-2 py-1 ${footer.bg || ""}`}></td>
              <td className={`border px-2 py-1 ${footer.bg || ""}`}></td>
              <td className={`border px-2 py-1 ${footer.bg || ""}`}></td>
              <td className={`border px-2 py-1 ${footer.bg || ""}`}></td>
              <td className={`border px-2 py-1 ${footer.bg || ""}`}></td>
              {footer.values.map((val, i) => (
                <td key={i} className={`border px-2 py-1 text-center ${footer.bg || ""}`}>
                  {val.toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GanttTable;

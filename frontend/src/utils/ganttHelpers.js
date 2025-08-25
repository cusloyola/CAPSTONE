
export const calculateTotalAmount = (tasks) =>
  tasks.reduce((sum, t) => sum + t.amount, 0);

export const calculateWeeklyTotals = (tasks, weeks) => {
  const totalAmount = calculateTotalAmount(tasks);
  return weeks.map((w) =>
    tasks.reduce((sum, t) => {
      const wt = (t.amount / totalAmount) * 100 || 0;
      if (w.weekIndex >= t.startWeek && w.weekIndex <= t.finishWeek)
        return sum + wt / t.duration;
      return sum;
    }, 0)
  );
};

export const mapApiTasks = (data) =>
  data.map((item, index) => ({
    itemNo: index + 1,
    description: item.item_title,
    amount: Number(item.amount) || 0,
    startWeek: 1,
    finishWeek: 4,
    duration: 4,
    color: "bg-blue-500",
    completedWeeks: [],
  }));











  
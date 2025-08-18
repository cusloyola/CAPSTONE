// exportDailyReport.js
import html2pdf from "html2pdf.js";

const exportDailyReport = (elementRef) => {
  if (!elementRef.current) return;

  const opt = {
    margin: 10,
    filename: "Daily_Report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().from(elementRef.current).set(opt).save();
};

export default exportDailyReport;

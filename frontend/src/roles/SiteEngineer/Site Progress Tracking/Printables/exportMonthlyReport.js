import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportMonthlyReport = (filteredReports) => {
    if (!filteredReports || filteredReports.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const img = new Image();
    img.src = "/images/assets/drl_construction_address.png";

    img.onload = () => {
        const logoWidth = 320;
        const logoHeight = 80;
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.addImage(img, "PNG", 40, 20, logoWidth, logoHeight);
        const monthsSet = new Set(
            filteredReports.map(report =>
                new Date(report.report_date).toLocaleString("en-US", { month: "long" })
            )
        );

        const monthOrder = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const sortedMonths = Array.from(monthsSet).sort(
            (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
        );

        const yearSet = new Set(
            filteredReports.map(report =>
                new Date(report.report_date).getFullYear()
            )
        );

        const monthsString = sortedMonths.join(", ");
        const yearString = Array.from(yearSet).join(", ");

        const title = `Monthly Site Report (${monthsString} ${yearString})`;


        const titleY = 20 + logoHeight + 30;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(title, pageWidth / 2, titleY, { align: "center" });

        const firstReport = filteredReports[0];
        let infoY = titleY + 50;
        if (firstReport) {
            doc.setFontSize(12);

            doc.setFont("helvetica", "bold");
            doc.text("Project:", 40, infoY);
            doc.setFont("helvetica", "normal");
            doc.text(firstReport.project_name || "-", 120, infoY);

            infoY += 20;
            doc.setFont("helvetica", "bold");
            doc.text("Location:", 40, infoY);
            doc.setFont("helvetica", "normal");
            doc.text(firstReport.location || "-", 120, infoY);

            infoY += 20;
            doc.setFont("helvetica", "bold");
            doc.text("Owner:", 40, infoY);
            doc.setFont("helvetica", "normal");
            doc.text(firstReport.client_name || "-", 120, infoY);

            infoY += 30;
        } else {
            infoY += 30;
        }

        const sortedReports = [...filteredReports].sort(
            (a, b) => new Date(a.report_date) - new Date(b.report_date)
        );

        const data = sortedReports.map((report) => [
            new Date(report.report_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }),
            report.weather_am || "-",
            report.weather_pm || "-",
            report.manpower?.length ? report.manpower.map(w => `${w.count} ${w.role}`).join(", ") : "-",
            report.selected_equipment?.length ? report.selected_equipment.map(e => `${e.quantity} ${e.name}`).join(", ") : "-",
            report.activities || "-",
            report.visitors || "-",
            report.notes || "-",
            report.full_name || "-",
        ]);

        autoTable(doc, {
            startY: infoY,
            head: [
                [
                    "Date",
                    "Weather AM",
                    "Weather PM",
                    "Manpower",
                    "Equipment",
                    "Activities",
                    "Visitors",
                    "Notes",
                    "Prepared By",
                ],
            ],
            body: data,
            theme: "grid",
            styles: {
                fontSize: 8,

            },
            headStyles: {
                fillColor: [230, 230, 230], 
                textColor: [0, 0, 0],       
                halign: "center",
                valign: "middle",
            },
            margin: { left: 40, right: 40 },
        });

        doc.save("Monthly_Report.pdf");
    };
};

export default exportMonthlyReport;

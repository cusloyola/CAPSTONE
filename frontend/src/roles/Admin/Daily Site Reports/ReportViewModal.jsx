const ReportViewModal = ({ isOpen, report, onClose }) => {
    if (!isOpen) return null; // Don't render if modal is not open

    const formatJSON = (data, fieldName) => {
        if (!data) return "No data available";

        try {
            let parsedData = data;
            if (typeof data === 'string') {
                parsedData = JSON.parse(data);
            }

            if (fieldName === "manpower" && typeof parsedData === "object") {
                // Reverse the display order for manpower (value first, then key)
                return Object.entries(parsedData)
                    .map(([key, value]) => <div key={key}>{value} - {key}</div>); // Display as "1 - Mason"
            }

            if (fieldName === "selected_equipment" && typeof parsedData === "object") {
                return Object.entries(parsedData)
                    .map(([key, value]) => <div key={key}>{value} - {key}</div>);
            }
            
            if (fieldName === "manpower" && typeof parsedData === "object") {
                return Object.entries(parsedData)
                    .map(([key, value]) => <div key={key}>{value} - {key}</div>);
            }
            
            if (fieldName === "selected_equipment" && typeof parsedData === "object") {
                return Object.entries(parsedData)
                    .map(([key, value]) => <div key={key}>{value} - {key}</div>);
            }
            
            if (fieldName === "activities" && typeof parsedData === "string") {
                return parsedData
                  .split("\n")
                  .map((line, index) => <div key={index}>- {line}</div>);
              }
              
            

            if (fieldName === "activities" && typeof parsedData === 'string') {
                return parsedData.split(',').map((activity, index) => (
                    <div key={index}>{activity.trim()}</div>
                ));
            } else if (fieldName === "activities" && Array.isArray(parsedData)) {
                return parsedData.map((activity, index) => <div key={index}>{activity.trim()}</div>);
            }

            if (Array.isArray(parsedData)) {
                return parsedData.map((item, index) => <div key={index}>{item}</div>);
            }

            if (typeof parsedData === "object") {
                return Object.entries(parsedData)
                    .map(([key, value]) => <div key={key}>{key}: {value}</div>);
            }

            return <div>{parsedData.toString() || "No data available"}</div>;

        } catch (error) {
            console.error(`Error parsing JSON for ${fieldName}:`, error);
            return <div>{data.toString() || "Invalid data format"}</div>;
        }
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Report Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        X
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <strong>Project Name:</strong> {report.project_name}
                    </div>
                    <div>
                        <strong>Location:</strong> {report.location}
                    </div>
                    <div>
                        <strong>Report Date:</strong> {new Date(report.report_date).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Owner:</strong> {report.owner}
                    </div>

                    <div>
  <strong>Activities:</strong> {formatJSON(report.activities, "activities")}
</div>


                    <div>
                        <strong>Weather:</strong>
                        <div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <strong className="ml-12">A.M. -</strong>
                                    <span>{report.weather_am ? report.weather_am : "No data available"}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <strong className="ml-12">P. M. -</strong>
                                    <span>{report.weather_pm ? report.weather_pm : "No data available"}</span>
                                </div>
                            </div>


                        </div>
                    </div>

                    <div>
                        <strong>Manpower:</strong>
                        <div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <span className="ml-12">
                                        {formatJSON(report.manpower, "manpower")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div>
                        <strong>Selected Equipment:</strong>
                        <div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <span className="ml-12">
                                    {formatJSON(report.selected_equipment, "selected_equipment")}                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


         
                    <div>
                        <strong>Visitors:</strong> {formatJSON(report.visitors, "visitors")}
                    </div>
                    <div>
                        <strong>Remarks:</strong> {formatJSON(report.remarks, "remarks")}
                    </div>
                    <div>
                        <strong>Prepared By:</strong> {formatJSON(report.prepared_by, "prepared_by")}
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>


    );
};

export default ReportViewModal;

import React from "react";
import { FILE_URL } from "../../../api/api";

const ViewIncidentReportModal = ({ report, onClose }) => {
  if (!report) return null;

  const images = [report.image1, report.image2, report.image3, report.image4];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          View Incident Report
        </h2>

        <div className="space-y-4">
          <p>
            <span className="font-semibold">Project:</span> {report.project_name}
          </p>
          <p>
            <span className="font-semibold">Incident Date:</span>{" "}
            {new Date(report.incident_date).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Reported By:</span> {report.full_name}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : "N/A"}
          </p>

          <div>
            <span className="font-semibold">Description:</span>
            <p className="mt-1 p-3 border rounded-xl bg-gray-50">
              {report.description}
            </p>
          </div>

          {images.some(Boolean) && (
            <div className="mt-4 grid grid-cols-2 gap-4 justify-center">
              {images.map(
                (img, index) =>
                  img && (
                    <div key={index} className="flex flex-col items-center">
                      <img
                        src={`${FILE_URL}/${img}?t=${Date.now()}`}
                        alt={`Incident Image ${index + 1}`}
                        className="w-48 h-48 object-cover rounded-lg shadow-md"
                      />
                      <p className="mt-2 text-sm text-gray-600 text-center">
                        Image {index + 1}
                      </p>
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewIncidentReportModal;

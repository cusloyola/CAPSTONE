// Buttons.jsx
import React from 'react';

// Component for View Summary, Download PDF, Approve, and Reject buttons
export const ActionButtons = ({ onViewSummary, onDownloadPDF, onApprove, onReject, buttonSize = 'normal' }) => {
  const baseClasses = "inline-flex items-center justify-center border border-transparent text-xs font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150";
  const summaryClasses = "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500";
  const downloadClasses = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
  const approveClasses = "bg-green-600 hover:bg-green-700 focus:ring-green-500"; // Green for Approve
  const rejectClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-500";   // Red for Reject

  // Adjust padding based on button size prop
  const paddingClasses = buttonSize === 'small' ? 'p-2' : 'px-4 py-2';
  const textClasses = buttonSize === 'small' ? '' : 'mr-1';


  return (
    <div className="flex space-x-2">
      <button
        onClick={onViewSummary}
        className={`${baseClasses} ${summaryClasses} ${paddingClasses}`}
        title="View Summary"
      >
        {/* Eye icon for View Summary */}
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${textClasses}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        {buttonSize !== 'small' && 'Summary'}
      </button>
      <button
        onClick={onDownloadPDF}
        className={`${baseClasses} ${downloadClasses} ${paddingClasses}`}
        title="Download PDF"
      >
        {/* Download icon for Download PDF */}
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${textClasses}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 01-2 0V5a2 2 0 012-2h10a2 2 0 012 2v12a1 1 0 11-2 0V5a1 1 0 00-1-1H4a1 1 0 00-1 1v12zm9 4a1 1 0 01-1-1v-3a1 1 0 112 0v3a1 1 0 01-1 1zm.707-10.293a1 1 0 00-1.414-1.414L9 11.586V8a1 1 0 10-2 0v3.586L4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {buttonSize !== 'small' && 'PDF'}
      </button>

      {/* Approve Button */}
      {onApprove && (
        <button
          onClick={onApprove}
          className={`${baseClasses} ${approveClasses} ${paddingClasses}`}
          title="Approve Report"
        >
          {/* Checkmark icon for Approve */}
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${textClasses}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {buttonSize !== 'small' && 'Approve'}
        </button>
      )}

      {/* Reject Button */}
      {onReject && (
        <button
          onClick={onReject}
          className={`${baseClasses} ${rejectClasses} ${paddingClasses}`}
          title="Reject Report"
        >
          {/* X-mark icon for Reject */}
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${textClasses}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {buttonSize !== 'small' && 'Reject'}
        </button>
      )}
    </div>
  );
};

// Component for Status Badge
export const StatusBadge = ({ status }) => {
  let badgeClasses = "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold";
  let badgeText = '';

  switch (status) {
    case 'pending':
      badgeClasses += " bg-yellow-400 text-yellow-900";
      badgeText = 'Pending';
      break;
    case 'approved':
      badgeClasses += " bg-emerald-500 text-white";
      badgeText = 'Approved';
      break;
    case 'rejected':
      badgeClasses += " bg-rose-500 text-white";
      badgeText = 'Rejected';
      break;
    default:
      badgeClasses += " bg-gray-300 text-gray-800";
      badgeText = 'Unknown';
  }

  return (
    <span className={badgeClasses}>
      {badgeText}
    </span>
  );
};
// Buttons.jsx
import React from 'react';

// Component for View Summary, Download PDF, Approve, and Reject buttons
export const ActionButtons = ({ onViewSummary, onDownloadPDF, onApprove, onReject, buttonSize = 'normal' }) => {
  // Base classes for all buttons including text size and border
  const baseClasses = "inline-flex items-center justify-center border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150";

  // Specific background and ring colors for each button type
  const summaryClasses = "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500";
  const downloadClasses = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
  const approveClasses = "bg-green-600 hover:bg-green-700 focus:ring-green-500"; // Green for Approve
  const rejectClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-500";   // Red for Reject

  // Adjust padding based on button size prop. All buttons will now have text.
  // Using fixed width (e.g., w-28 for normal, w-24 for small) for consistent sizing.
  const buttonWidthClass = buttonSize === 'small' ? 'w-24' : 'w-28'; // Defined fixed width for consistent size
  const paddingClasses = buttonSize === 'small' ? 'px-2 py-1.5' : 'px-4 py-2'; // Adjusted padding for better fit
  const iconMarginClass = 'mr-1'; // Margin for icon when followed by text


  return (
    <div className="flex flex-col space-y-2"> {/* Main container for two rows, stacked vertically */}
      <div className="flex space-x-2"> {/* First row for Summary and PDF */}
        <button
          onClick={onViewSummary}
          className={`${baseClasses} ${summaryClasses} ${paddingClasses} ${buttonWidthClass}`}
          title="View Summary"
        >
          {/* Eye icon for View Summary */}
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${iconMarginClass}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Summary {/* Always show text */}
        </button>
        <button
          onClick={onDownloadPDF}
          className={`${baseClasses} ${downloadClasses} ${paddingClasses} ${buttonWidthClass}`}
          title="Download PDF"
        >
          {/* Download icon for Download PDF */}
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="currentColor" fill-opacity="0" stroke-dasharray="20" stroke-dashoffset="20" d="M12 4h2v6h2.5l-4.5 4.5M12 4h-2v6h-2.5l4.5 4.5"><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.5s" values="0;1"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="20;0"/></path><path stroke-dasharray="14" stroke-dashoffset="14" d="M6 19h12"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="14;0"/></path></g></svg>
          PDF {/* Always show text */}
        </button>
      </div>

      <div className="flex space-x-2"> {/* Second row for Approve and Reject */}
        {/* Approve Button */}
        {onApprove && (
          <button
            onClick={onApprove}
            className={`${baseClasses} ${approveClasses} ${paddingClasses} ${buttonWidthClass}`}
            title="Approve Report"
          >
            {/* Checkmark icon for Approve */}
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${iconMarginClass}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Approve {/* Always show text */}
          </button>
        )}

        {/* Reject Button */}
        {onReject && (
          <button
            onClick={onReject}
            className={`${baseClasses} ${rejectClasses} ${paddingClasses} ${buttonWidthClass}`}
            title="Reject Report"
          >
            {/* X-mark icon for Reject */}
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className={`h-4 w-4 ${iconMarginClass}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Reject {/* Always show text */}
          </button>
        )}
      </div>
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  let badgeClasses = "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold";
  let badgeText = '';

  // Normalize status string to lowercase
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
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

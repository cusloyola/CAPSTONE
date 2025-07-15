import React, { useCallback } from 'react';

const ActivityItem = ({
  activity,
  index,
  isCurrentDay,
  handleActivityChange,
  handleImageChange,
  removeImage,
  confirmRemoveActivity,
  toggleModal,
  fileInputRefs,
  expandedActivities,
  setExpandedActivities,
}) => {
  const isExpanded = expandedActivities[index];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageChange(index, e.dataTransfer.files);
    }
  }, [index, handleImageChange]);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 shadow-sm">
      <div
        className="flex justify-between items-center px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800 cursor-pointer"
        onClick={() => setExpandedActivities(prev => ({ ...prev, [index]: !prev[index] }))}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          ACTIVITY {index + 1} DETAILS
          <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
        {isCurrentDay && (
          <button
            onClick={(e) => { e.stopPropagation(); confirmRemoveActivity(index); }}
            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Delete Activity"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 3a1 1 0 100 2v4a1 1 0 102 0v-4a1 1 0 00-2 0z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
          <textarea
            id={`activity-details-${index}`}
            rows="4"
            className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
            placeholder="Describe the activity..."
            value={activity.text}
            onChange={(e) => handleActivityChange(index, e.target.value)}
            disabled={!isCurrentDay}
          ></textarea>
          <div
            className={`mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center ${isCurrentDay ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-100'} hover:border-blue-500 hover:bg-blue-50 transition duration-200 ease-in-out`}
            onDragOver={isCurrentDay ? handleDragOver : null}
            onDragLeave={isCurrentDay ? handleDragLeave : null}
            onDrop={isCurrentDay ? handleDrop : null}
            onClick={() => isCurrentDay && fileInputRefs.current[index]?.click()}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(index, e.target.files)}
              disabled={!isCurrentDay}
              className="hidden"
              ref={el => fileInputRefs.current[index] = el}
            />
            <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L40 32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-base text-gray-600">DRAG IMAGES / CLICK TO UPLOAD</p>
          </div>
          {activity.images?.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {activity.images.map((img, imgIndex) => (
                <div key={imgIndex} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${imgIndex}`}
                    className="w-60 h-60 object-cover border rounded-lg cursor-pointer hover:scale-105 transition"
                    onClick={() => toggleModal('selectedImage', true, { activityIndex: index, imageIndex: imgIndex })}
                  />
                  <button
                    onClick={() => removeImage(index, imgIndex)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityItem;
import React from 'react';
import dayjs from 'dayjs';

const DayNavigation = ({ daysOfWeek, currentDayIndex, activeDay, setActiveDay, reportData, currentActiveReport }) => {
  return (
    <ol className="flex justify-center items-center w-full p-4 space-x-4 text-lg sm:text-m font-semibold text-center text-gray-700 bg-white border border-gray-200 rounded-lg shadow mb-6 overflow-x-auto">
      {daysOfWeek.map((day, index) => {
        const isToday = index === currentDayIndex;
        const isActiveDay = day === activeDay;
        const dayHasData = reportData[currentActiveReport?.project_name]?.[day]?.some(a => (a && a.text && a.text.trim() !== '') || (a.images && a.images.length > 0));
        return (
          <li
            key={day}
            onClick={isToday ? () => setActiveDay(day) : undefined}
            className={`flex items-center
              ${isActiveDay ? 'text-blue-600 font-bold' : 'text-gray-500'}
              ${isToday ? 'cursor-pointer hover:text-blue-500' : 'cursor-not-allowed opacity-50'}
              ${dayHasData && !isActiveDay ? 'text-green-600' : ''}
            `}
          >
            <span
              className={`flex items-center justify-center h-10 px-6 border rounded-full uppercase
                ${isActiveDay ? 'border-blue-600 bg-blue-100' : 'border-gray-400'}
                ${dayHasData && !isActiveDay ? 'bg-green-100 border-green-600' : ''}
              `}
            >
              {day}
            </span>
            {index < daysOfWeek.length - 1 && (
              <svg className="w-4 h-4 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
              </svg>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default DayNavigation;
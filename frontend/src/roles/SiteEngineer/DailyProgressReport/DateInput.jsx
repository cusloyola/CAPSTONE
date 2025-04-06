import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS

const DateInput = ({ date: initialDate, onChange }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : null);

  const handleChange = (date) => {
    setSelectedDate(date);
    if (date) {
      // Format the date to "April 07, 2025"
      const options = { year: 'numeric', month: 'long', day: '2-digit' };
      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
      onChange(formattedDate); // Pass the formatted date back
    } else {
      onChange(''); // Or handle null/empty date as needed
    }
  };

  return (
    <div>
      <label className="block font-medium mt-2">Date</label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="MMMM dd, yyyy" 
        className="w-full border p-2 rounded"
      />
    </div>
  );
};

export default DateInput;
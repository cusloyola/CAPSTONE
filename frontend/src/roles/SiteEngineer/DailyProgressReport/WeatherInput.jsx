import React from "react";

const WeatherInput = ({ weatherAM, weatherPM, onWeatherAMChange, onWeatherPMChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div>
        <label className="block font-medium">Weather (AM)</label>
        <select value={weatherAM} onChange={onWeatherAMChange} className="w-full border p-2 rounded">
          <option value="">Select Weather (AM)</option>
          <option value="Sunny">Sunny</option>
          <option value="Cloudy">Cloudy</option>
          <option value="Rainy">Rainy</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Weather (PM)</label>
        <select value={weatherPM} onChange={onWeatherPMChange} className="w-full border p-2 rounded" >
          <option value="">Select Weather (PM)</option>
          <option value="Sunny">Sunny</option>
          <option value="Cloudy">Cloudy</option>
          <option value="Rainy">Rainy</option>
        </select>
      </div>
    </div>
  );
};

export default WeatherInput;

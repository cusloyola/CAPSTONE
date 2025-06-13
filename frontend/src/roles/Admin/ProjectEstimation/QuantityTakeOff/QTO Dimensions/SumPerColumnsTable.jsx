import React, { useState } from 'react';

const columns = ['Segment A', 'Segment B', 'Segment C']; // adjust as needed
const rows = ['c1', 'c2', 'c3', 'pc1', 'fc1'];

const calculateVolume = ({ L, W, D, U }) => {
  const l = parseFloat(L) || 0;
  const w = parseFloat(W) || 0;
  const d = parseFloat(D) || 0;
  const u = parseFloat(U) || 1;
  return (l * w * d * u).toFixed(3);
};

const SumPerColumnsTable = () => {
  const [data, setData] = useState(() => {
   const init = {};
rows.forEach(row => {
  init[row] = {};
  columns.forEach(col => {
    init[row][col] = { L: '', W: '', D: '', U: '1' };
  });
});

    return init;
  });

  const handleChange = (row, col, field, value) => {
    setData(prev => ({
      ...prev,
      [row]: {
        ...prev[row],
        [col]: {
          ...prev[row][col],
          [field]: value,
        },
      },
    }));
  };

  const columnTotal = col => {
    return rows.reduce((sum, row) => {
      return sum + parseFloat(calculateVolume(data[row][col]) || 0);
    }, 0).toFixed(3);
  };

  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr>
          <th className="border px-2 py-1 bg-gray-100">Mark</th>
          {columns.map(col => (
            <th key={col} className="border px-2 py-1 bg-gray-100">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row} className="border-b">
            <td className="border px-2 py-1 font-bold bg-gray-50">{row}</td>
            {columns.map(col => {
              const cell = data[row][col];
              const vol = calculateVolume(cell);
              return (
                <td key={col} className="border px-2 py-1">
                  <div className="grid grid-cols-4 gap-1">
                    {['L','W','D','U'].map(field => (
                      <input
                        key={field}
                        type="number"
                        placeholder={field}
                        value={cell[field]}
                        onChange={e => handleChange(row, col, field, e.target.value)}
                        className="w-full h-8 border rounded px-1 text-xs"
                      />
                    ))}
                  </div>
                  <div className="text-center text-sm mt-1 font-medium">
                    {vol} m³
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-gray-200 font-bold">
          <td className="border px-2 py-1">Total</td>
          {columns.map(col => (
            <td key={col} className="border px-2 py-1 text-center">
              {columnTotal(col)} m³
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
};

export default SumPerColumnsTable;

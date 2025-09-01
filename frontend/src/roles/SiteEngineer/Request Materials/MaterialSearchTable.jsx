import React from 'react';

const MaterialSearchTable = ({
  materials,
  loading,
  error,
  searchInput,
  setSearchInput,
  brandFilter,
  setBrandFilter,
  brandOptions,
  selectedMaterials,
  toggleMaterial,
  limit,
  setLimit,
  page,
  setPage,
  totalItems
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startEntry = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalItems);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Select Materials</h3>
      {/* Brand Category Filter */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="block font-medium text-gray-700">Brand Category:</label>
        <select
          className="border p-2 rounded w-48"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="">All Brand Categories</option>
          {brandOptions.map((brand) => (
            <option key={brand.brand_id} value={brand.brand_name}>
              {brand.brand_name}
            </option>
          ))}
        </select>
      </div>
      {/* Search and Show Entries */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="show-entries" className="font-medium">Show</label>
          <select
            id="show-entries"
            className="border rounded px-2 py-1 pr-4 appearance-none"
            value={limit}
            onChange={e => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M4 6L8 10L12 6\' stroke=\'%23333\' strokeWidth=\'2\' strokeLinecap=\'round\' strokeLinejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
          >
            {[10, 25, 50, 100].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="ml-2">entries</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="search-materials" className="font-medium">Search:</label>
          <input
            id="search-materials"
            type="text"
            placeholder="Search by Material Name..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      {/* Materials Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b  border-r text-center">Select</th>
              <th className="p-3 border-b  border-r text-center ">Material Name</th>
              <th className="p-3 border-b  border-r text-center">Unit</th>
              <th className="p-3 border-b  border-r text-center">Brand</th>
              <th className="p-3 border-b  border-r text-center">Unit Cost</th>
              <th className="p-3 border-b  border-r text-center">Stock Quantity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-4 text-gray-500">Loading materials...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="text-center p-4 text-red-500">{error}</td></tr>
            ) : materials.length > 0 ? (
              materials.map((material) => (
                <tr key={material.resource_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 border-r">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.some(m => m.resource_id === material.resource_id)}
                      onChange={() => toggleMaterial(material)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3 border-r">{material.material_name}</td>
                  <td className="p-3 border-r">{material.unitName || material.unitId}</td>
                  <td className="p-3 border-r">{material.brand_name || material.brand_id}</td>
                  <td className="p-3 border-r text-right">₱{Number(material.default_unit_cost).toFixed(2)}</td>
                  <td className="p-3 text-center">{material.stocks}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center p-4 text-gray-500">No materials found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-2">
        <div>
          <span className="text-sm text-gray-700">Showing {startEntry} to {endEntry} of {totalItems} entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialSearchTable;
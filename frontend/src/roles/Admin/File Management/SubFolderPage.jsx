import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"; // Modal
import Button from "../../../components/ui/button/Button"; // Default export

const FOLDERS_API_URL = "http://localhost:5000/api/folders"; // Folders API endpoint

const SubFolderPage = () => {
  const { clientId, folderId } = useParams(); // Get clientId and folderId from URL params
  const navigate = useNavigate(); // For navigation

  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [folderName, setFolderName] = useState(''); // Track folder name input

  // Ensure folderId is valid before fetching subfolders
  useEffect(() => {
    if (folderId) {
      fetchSubFolders();
    } else {
      setError("Folder ID is missing.");
    }
  }, [clientId, folderId]); // Fetch subfolders when clientId or folderId changes

  const fetchSubFolders = async () => {
    setLoadingFolders(true); // Set loading state to true before fetching

    try {
        const response = await fetch(`${FOLDERS_API_URL}/subfolders/${clientId}/${folderId}`);
        const data = await response.json();

      if (Array.isArray(data)) {
        setFolders(data); // Set folders if data is an array
      } else {
        setFolders([]); // Reset folders if data is not an array
      }
    } catch (err) {
      setError("Failed to fetch subfolders. Please try again.");
      setFolders([]); // Reset folders in case of error
    } finally {
      setLoadingFolders(false); // Set loading to false once done
    }
  };

  const handleBackClick = () => {
    // Navigate back to the parent folder view based on clientId
    navigate(`/clients/${clientId}/folders`);
  };

  const handleCreateFolder = async () => {
    if (!folderName) return; // Don't allow creating a folder with no name

    try {
      // Send POST request to create a folder
      const response = await fetch(FOLDERS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_name: folderName,
          client_id: clientId,
          parent_folder_id: folderId, // Use folderId as the parent folder ID
        }),
      });

      if (response.ok) {
        setFolderName(''); // Reset folder name input
        setIsModalOpen(false); // Close modal after creation
        fetchSubFolders(); // Refresh subfolder list without changing the URL
      } else {
        setError("Failed to create folder. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while creating the subfolder. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={handleBackClick}>← Back to Parent Folder</Button>
        <Button onClick={() => setIsModalOpen(true)}>+ Create Subfolder</Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Subfolders of Folder {folderId}</h2>

      {/* Display error if exists */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Loading State */}
      {loadingFolders ? (
        <p>Loading subfolders...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6">
          {folders.length === 0 ? (
            <p>No subfolders found for this folder.</p> // Show message if no subfolders exist
          ) : (
            folders.map((folder) => (
              <div
                key={folder.folder_id}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 cursor-pointer"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <span className="text-xl text-gray-800 dark:text-white">📁</span>
                </div>

                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Folder Name
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                      {folder.folder_name}
                    </h4>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Folder Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">Create New Subfolder</DialogTitle>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <span className="text-xl text-gray-800 dark:text-white">📂</span>
              </div>

              <div className="mt-5">
                <label htmlFor="folderName" className="block text-sm text-gray-500 dark:text-gray-400">Folder Name</label>
                <input
                  type="text"
                  id="folderName"
                  value={folderName} // Bind the input to folderName state
                  onChange={(e) => setFolderName(e.target.value)} // Update folder name state on change
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
                  placeholder="Enter subfolder name"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setIsModalOpen(false)} className="mr-4">Close</Button>
                <Button onClick={handleCreateFolder} className="bg-blue-600 text-white">Create Subfolder</Button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default SubFolderPage;

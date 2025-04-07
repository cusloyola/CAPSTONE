import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"; 
import Button from "../../../components/ui/button/Button"; 

const FOLDERS_API_URL = "http://localhost:5000/api/folders";

export default function FolderPage() {
  const { clientId } = useParams(); 
  const navigate = useNavigate(); 

  const [folders, setFolders] = useState([]); 
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null); 
  const [folderName, setFolderName] = useState(''); 

  useEffect(() => {
    fetchFolders();
  }, [clientId, currentFolder]); // Fetch folders whenever clientId or currentFolder changes

  const fetchFolders = async () => {
    try {
      const url = currentFolder
        ? `${FOLDERS_API_URL}/${clientId}/${currentFolder.folder_id}` // Fetch subfolders for the current folder
        : `${FOLDERS_API_URL}/${clientId}`; // Fetch root folders
      const response = await fetch(url);
      const data = await response.json();
      setFolders(Array.isArray(data) ? data : []); // Ensure data is an array before setting it
    } catch (err) {
      setError(err.message);
      setFolders([]); // In case of an error, reset folders to an empty array
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleBackClick = () => {
    setCurrentFolder(null); // Go back to the parent folder (or client level if at root)
  };

  const handleFolderClick = (folder) => {
    navigate(`/clients/${clientId}/folders/${folder.folder_id}`);  // Navigate to subfolder
    setCurrentFolder(folder); // Set the current folder when navigating to a subfolder
  };

  const handleCreateFolder = async () => {
    if (!folderName) return; // Don't allow creating a folder with no name

    try {
      // Ensure that we're passing the correct parent_folder_id.
      const parentFolderId = currentFolder ? currentFolder.folder_id : null; // If inside a folder, use its folder_id

      await fetch(FOLDERS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_name: folderName,
          client_id: clientId,
          parent_folder_id: parentFolderId, // Pass the parent folder ID for subfolder creation
        }),
      });

      setFolderName(''); // Reset folder name input
      setIsModalOpen(false); // Close modal after creation
      fetchFolders(); // Refresh folder list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={handleBackClick}>
          {currentFolder ? "← Back to Parent Folder" : "← Back to Clients"}
        </Button>
        <Button onClick={() => setIsModalOpen(true)}>+ Create Folder</Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {currentFolder
          ? `Subfolders of ${currentFolder.folder_name}`
          : "Folders for Client"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6">
        {loadingFolders ? (
          <p>Loading folders...</p>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.folder_id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 cursor-pointer"
              onClick={() => handleFolderClick(folder)} // Go inside the folder
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

      {/* Add Folder Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">Create New Folder</DialogTitle>

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
                  placeholder="Enter folder name"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setIsModalOpen(false)} className="mr-4">Close</Button>
                <Button onClick={handleCreateFolder} className="bg-blue-600 text-white">Create Folder</Button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

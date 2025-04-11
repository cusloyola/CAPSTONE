import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "../../../components/ui/button/Button";

const FOLDERS_API_URL = "http://localhost:5000/api/folders";
const FILES_API_URL = "http://localhost:5000/api/files/upload"; // ✅ This matches your backend route

export default function FolderPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [error, setError] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false); // For file modal
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [file, setFile] = useState(null); // For file selection

  // Fetch folders whenever clientId or currentFolder changes
  useEffect(() => {
    fetchFolders();
  }, [clientId, currentFolder]);

  const fetchFolders = async () => {
    try {
      const url = currentFolder
        ? `${FOLDERS_API_URL}/${clientId}/${currentFolder.folder_id}` // Fetch subfolders for the current folder
        : `${FOLDERS_API_URL}/${clientId}`; // Fetch root folders if no currentFolder is selected
      
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setFolders(data); // Set fetched folders
      } else {
        setFolders([]); // Reset if data isn't an array
        setError("Unexpected data format.");
      }
    } catch (err) {
      setError("Error fetching folders: " + err.message);
      setFolders([]); // Reset on error
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleBackClick = () => {
    setCurrentFolder(null); // Reset current folder when navigating back
    navigate(`/clients/${clientId}/folders`); // Navigate to the client's folder view
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder); // Set the current folder to navigate
    navigate(`/clients/${clientId}/folders/${folder.folder_id}`); // Navigate to subfolder
  };

  const handleCreateFolder = async () => {
    if (!folderName) return; // Do not proceed if no folder name is provided

    try {
      const parentFolderId = currentFolder ? currentFolder.folder_id : null;
      const response = await fetch(FOLDERS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_name: folderName,
          client_id: clientId,
          parent_folder_id: parentFolderId,
        }),
      });

      if (response.ok) {
        setFolderName('');  // Reset folder name input
        setIsFolderModalOpen(false); // Close the modal after folder creation
        fetchFolders(); // Refresh the folder view
      } else {
        throw new Error("Failed to create folder.");
      }
    } catch (err) {
      setError("Error creating folder: " + err.message);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Set selected file to state
  };

  const handleUploadFile = async () => {
    const folderId = currentFolder ? currentFolder.folder_id : null;

    // If no folder is selected, show an error
    if (!folderId) {
      setError("Please select a valid folder before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", folderId); // Folder ID (could be null if no folder selected)
    formData.append("client_id", clientId);
    formData.append("file_name", file.name);

    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage

      const response = await fetch(FILES_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add the token here
        },
        body: formData,
      });

      if (response.ok) {
        setFile(null); // Clear the file input after successful upload
        setIsFileModalOpen(false); // Close the file upload modal
        fetchFolders(); // Refresh folder data
      } else {
        throw new Error("File upload failed.");
      }
    } catch (err) {
      setError("Error uploading file: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={handleBackClick}>
          {currentFolder ? "← Back to Parent Folder" : "← Back to Clients"}
        </Button>
        <Button onClick={() => setIsFolderModalOpen(true)}>+ Create Folder</Button>
        <Button onClick={() => setIsFileModalOpen(true)}>+ Add File</Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {currentFolder ? `Subfolders of ${currentFolder.folder_name}` : "Folders for Client"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6">
        {loadingFolders ? (
          <p>Loading folders...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p> // Display error if any
        ) : (
          folders.map((folder) => (
            <div
              key={folder.folder_id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 cursor-pointer"
              onClick={() => handleFolderClick(folder)}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <span className="text-xl text-gray-800 dark:text-white">📁</span>
              </div>

              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Folder Name</span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {folder.folder_name}
                  </h4>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Folder Modal */}
      <Dialog open={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">Create New Folder</DialogTitle>
            <div className="mt-5">
              <label htmlFor="folderName" className="block text-sm text-gray-500">Folder Name</label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Enter folder name"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsFolderModalOpen(false)} className="mr-4">Close</Button>
              <Button onClick={handleCreateFolder} className="bg-blue-600 text-white">Create Folder</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={isFileModalOpen} onClose={() => setIsFileModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">Upload File</DialogTitle>
            <div className="mt-5">
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-2 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsFileModalOpen(false)} className="mr-4">Close</Button>
              <Button onClick={handleUploadFile} className="bg-blue-600 text-white">Upload File</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

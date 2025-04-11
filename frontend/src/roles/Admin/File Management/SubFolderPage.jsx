import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "../../../components/ui/button/Button";

const FOLDERS_API_URL = "http://localhost:5000/api/folders";
const FILES_API_URL = "http://localhost:5000/api/files/upload";
const FETCH_FILES_API_URL = "http://localhost:5000/api/files";

const SubFolderPage = () => {
  const { clientId, folderId } = useParams();
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [folderName, setFolderName] = useState('');
  const [file, setFile] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null); // For local object URL

  useEffect(() => {
    if (folderId) {
      fetchSubFolders();
      fetchFiles();
    } else {
      setError("Folder ID is missing.");
    }
  }, [clientId, folderId]);

  const fetchSubFolders = async () => {
    setLoadingFolders(true);
    try {
      const response = await fetch(`${FOLDERS_API_URL}/subfolders/${clientId}/${folderId}`);
      if (!response.ok) throw new Error('Failed to fetch subfolders');
      const data = await response.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch subfolders. Please try again.");
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch(`${FETCH_FILES_API_URL}/${clientId}/${folderId}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError("Failed to fetch files. Please try again.");
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/clients/${clientId}/folders`);
  };

  const handleCreateFolder = async () => {
    if (!folderName) return;
    try {
      const response = await fetch(FOLDERS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_name: folderName, client_id: clientId, parent_folder_id: folderId }),
      });
      if (!response.ok) throw new Error("Failed to create folder");
      setFolderName('');
      setIsCreateFolderModalOpen(false);
      fetchSubFolders();
    } catch (err) {
      setError("An error occurred while creating the subfolder. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", folderId);
    formData.append("client_id", clientId);
    try {
      setLoadingFiles(true);
      const response = await fetch(FILES_API_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload file");
      setFile(null);
      setIsFileUploadModalOpen(false);
      fetchFiles();
    } catch (err) {
      setError("An error occurred while uploading the file. Please try again.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleViewFile = async (file) => {
    setViewingFile(file);
    setObjectUrl(null); // Clear any previous object URL
    setTextContent(''); // Clear previous text content

    if (file.file_name.toLowerCase().endsWith('.pdf')) {
      try {
        const response = await fetch(file.file_url, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, // Include authorization if needed
        });
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } catch (error) {
        setError("Failed to view PDF.");
        console.error("Error fetching PDF:", error);
      }
    } else if (file.file_name.toLowerCase().endsWith('.txt')) {
      try {
        const response = await fetch(file.file_url);
        if (!response.ok) throw new Error(`Failed to fetch text file: ${response.status}`);
        const text = await response.text();
        setTextContent(text);
      } catch (error) {
        setError("Failed to view text file.");
      }
    } else if (file.file_name.toLowerCase().match(/\.(png|jpe?g|gif)$/)) {
      setObjectUrl(file.file_url); // Use direct URL for images
    } else {
      setObjectUrl(null); // No preview available
    }
  };

  const handleCloseFileViewer = () => {
    setViewingFile(null);
    setTextContent('');
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl); // Clean up the object URL
      setObjectUrl(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={handleBackClick}>← Back to Folders</Button>
        <div className="space-x-2">
          <Button onClick={() => setIsCreateFolderModalOpen(true)}>+ Create Folder</Button>
          <Button onClick={() => setIsFileUploadModalOpen(true)}>+ Upload File</Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Subfolders and Files</h2>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {loadingFolders ? (
        <p>Loading subfolders...</p>
      ) : (
        folders.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Subfolders:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div key={folder.folder_id} className="rounded-md border border-gray-300 p-4 cursor-pointer">
                  <span>📁 {folder.folder_name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {loadingFiles ? (
        <p>Loading files...</p>
      ) : (
        files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Files:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.file_id} className="rounded-md border border-gray-300 p-4 cursor-pointer" onClick={() => handleViewFile(file)}>
                  <span>📄 {file.file_name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {!loadingFolders && folders.length === 0 && !loadingFiles && files.length === 0 && (
        <p>No subfolders or files in this folder.</p>
      )}

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderModalOpen} onClose={() => setIsCreateFolderModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto bg-black/50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">Create New Subfolder</DialogTitle>
            <div className="mt-5">
              <label className="block text-sm text-gray-500">Folder Name</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded"
                placeholder="Enter subfolder name"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={() => setIsCreateFolderModalOpen(false)} className="bg-gray-300 text-white">Cancel</Button>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={isFileUploadModalOpen} onClose={() => setIsFileUploadModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto bg-black/50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">Upload File</DialogTitle>
            <div className="mb-4">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Select File</label>
              <input
                type="file"
                id="file"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onChange={handleFileChange}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={() => setIsFileUploadModalOpen(false)} variant="secondary">Cancel</Button>
              <Button onClick={handleFileUpload} disabled={!file}>Upload</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* File Viewer Modal */}
      <Dialog open={viewingFile !== null} onClose={handleCloseFileViewer} className="fixed z-50 inset-0 overflow-y-auto bg-black/50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-4xl w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">File Viewer - {viewingFile?.file_name}</DialogTitle>
            {viewingFile && (
              <>
                {viewingFile.file_name.toLowerCase().endsWith('.pdf') && objectUrl ? (
                  <iframe src={objectUrl} width="100%" height="500px" title="PDF Viewer" />
                ) : viewingFile.file_name.toLowerCase().endsWith('.txt') ? (
                  <pre className="bg-gray-100 p-4 rounded overflow-auto h-[500px] whitespace-pre-wrap">{textContent}</pre>
                ) : viewingFile.file_name.toLowerCase().match(/\.(png|jpe?g|gif)$/) && objectUrl ? (
                  <img src={objectUrl} alt={viewingFile.file_name} className="max-h-[500px] mx-auto" />
                ) : (
                  <div className="text-center">
                    <p>Cannot preview this file type.</p>
                    <a href={viewingFile.file_url} download target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Download File</a>
                  </div>
                )}
              </>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCloseFileViewer}>Close</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default SubFolderPage;
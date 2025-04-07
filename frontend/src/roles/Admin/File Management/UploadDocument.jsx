import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UploadDocument = () => {
  const { folder_id } = useParams();
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('document_name', documentName);
    formData.append('document_type', documentType);
    formData.append('file', file);
    formData.append('folder_id', folder_id);

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document!');
    }
  };

  return (
    <div>
      <h1>Upload Document</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Document Name:</label>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Document Type:</label>
          <input
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
          />
        </div>
        <div>
          <label>File:</label>
          <input type="file" onChange={handleFileChange} required />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadDocument;

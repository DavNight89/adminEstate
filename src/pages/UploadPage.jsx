// pages/UploadPage.jsx
import React, { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import { extractTextFromFile, generateThumbnail, compressImage } from '../utils/fileProcessing';

const UploadPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleFilesChange = async (files) => {
    setUploadedFiles(files);
    
    // Process files further if needed
    setProcessing(true);
    for (const fileData of files) {
      if (fileData.status === 'processed') {
        try {
          // Extract text content
          const textContent = await extractTextFromFile(fileData.file);
          
          // Generate thumbnail for images
          const thumbnail = await generateThumbnail(fileData.file);
          
          // Compress images if needed
          const compressedFile = await compressImage(fileData.file);
          
          // Update file data with processed information
          fileData.textContent = textContent;
          fileData.thumbnail = thumbnail;
          fileData.compressedFile = compressedFile;
          
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }
    }
    setProcessing(false);
  };

  const uploadToServer = async () => {
    const formData = new FormData();
    
    uploadedFiles.forEach((fileData, index) => {
      if (fileData.status === 'processed') {
        // Use compressed version if available
        const fileToUpload = fileData.compressedFile || fileData.file;
        formData.append(`file_${index}`, fileToUpload);
        
        // Add metadata
        formData.append(`metadata_${index}`, JSON.stringify({
          originalName: fileData.name,
          textContent: fileData.textContent,
          hasPreview: !!fileData.preview
        }));
      }
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Files uploaded successfully!');
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-page">
      <h1>Document Upload</h1>
      
      <DocumentUpload
        onFilesChange={handleFilesChange}
        maxFiles={5}
        maxFileSize={5 * 1024 * 1024} // 5MB
        acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
        enablePreview={true}
      />
      
      {processing && (
        <div className="processing-status">
          Processing files for upload...
        </div>
      )}
      
      {uploadedFiles.length > 0 && !processing && (
        <div className="upload-actions">
          <button 
            onClick={uploadToServer}
            className="upload-btn"
            disabled={uploadedFiles.some(f => f.status === 'error')}
          >
            Upload {uploadedFiles.filter(f => f.status === 'processed').length} Files
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
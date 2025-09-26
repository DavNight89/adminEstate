// components/DocumentUpload.jsx
import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Eye } from 'lucide-react';


const DocumentUpload = ({ 
  onFilesChange, 
  maxFiles = 10, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
  enablePreview = true 
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit`);
    }
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      errors.push(`File type ${fileExtension} not supported`);
    }
    
    return errors;
  };

  const processFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const processedFile = {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'processed',
          preview: null,
          errors: [],
          data: e.target.result
        };

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          processedFile.preview = e.target.result;
        }

        // Validate file
        const validationErrors = validateFile(file);
        if (validationErrors.length > 0) {
          processedFile.status = 'error';
          processedFile.errors = validationErrors;
        }

        resolve(processedFile);
      };

      reader.onerror = () => {
        resolve({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'error',
          errors: ['Failed to read file'],
          data: null
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (newFiles) => {
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setProcessing(true);
    
    const processedFiles = await Promise.all(
      Array.from(newFiles).map(processFile)
    );

    const updatedFiles = [...files, ...processedFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    setProcessing(false);
  }, [files, maxFiles, onFilesChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="document-upload">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${processing ? 'processing' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <Upload size={48} className="upload-icon" />
          <h3>Drop files here or click to browse</h3>
          <p>
            Supports: {acceptedTypes.join(', ')} 
            <br />
            Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB per file
            <br />
            Max files: {maxFiles}
          </p>
          {processing && <div className="processing-indicator">Processing files...</div>}
        </div>
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <h4>Uploaded Files ({files.length}/{maxFiles})</h4>
          {files.map((file) => (
            <div key={file.id} className={`file-item ${file.status}`}>
              <div className="file-info">
                <div className="file-icon">
                  {file.preview && enablePreview ? (
                    <img src={file.preview} alt="Preview" className="file-preview" />
                  ) : (
                    <File size={24} />
                  )}
                </div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                  {file.errors.length > 0 && (
                    <div className="file-errors">
                      {file.errors.map((error, index) => (
                        <div key={index} className="error-message">{error}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="file-actions">
                <div className="file-status">
                  {file.status === 'processed' && <CheckCircle size={20} className="success" />}
                  {file.status === 'error' && <AlertCircle size={20} className="error" />}
                </div>
                {enablePreview && file.preview && (
                  <button
                    className="preview-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Implement preview modal logic here
                    }}
                  >
                    <Eye size={16} />
                  </button>
                )}
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
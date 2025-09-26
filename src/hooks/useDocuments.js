import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useDocuments = () => {
  const [documents, setDocuments] = useLocalStorage('documents', []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleDocumentUpload = (uploadedFiles) => {
    // Move your upload logic here
  };

  const deleteDocument = (documentId) => {
    // Move your delete logic here
  };

  return {
    documents,
    setDocuments,
    showUploadModal,
    setShowUploadModal,
    selectedCategory,
    setSelectedCategory,
    selectedProperty,
    setSelectedProperty,
    handleDocumentUpload,
    deleteDocument
  };
};


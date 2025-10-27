// Document Service - Handles all document-related operations
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const documentService = {
  /**
   * Process and upload documents
   * @param {Array} uploadedFiles - Array of files to process
   * @param {string} category - Document category (lease, maintenance, etc.)
   * @param {string} property - Associated property name
   * @returns {Array} Processed document objects
   */
  handleDocumentUpload: async (uploadedFiles, category = 'general', property = 'All Properties') => {
    const processedDocuments = [];
    
    for (const file of uploadedFiles) {
      try {
        const processedDoc = await documentService.processFile(file, category, property);
        processedDocuments.push(processedDoc);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }
    
    return processedDocuments;
  },

  /**
   * Process individual file
   * @param {File} file - File to process
   * @param {string} category - Document category
   * @param {string} property - Associated property
   * @returns {Object} Processed document object
   */
  processFile: async (file, category, property) => {
    const document = {
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type || file.name.split('.').pop().toUpperCase(),
      size: file.size,
      category,
      property,
      uploadDate: new Date().toISOString(),
      url: null,
      content: null, // Extracted text content
      fileType: documentService.getFileType(file.type)
    };

    // Convert file to base64 for storage
    document.url = await documentService.fileToBase64(file);

    // Extract text content if possible
    if (file.type === 'application/pdf') {
      document.content = await documentService.extractPDFText(file);
    } else if (file.type.startsWith('image/')) {
      document.content = await documentService.extractImageText(file);
    }

    return document;
  },

  /**
   * Convert file to base64 data URL
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 data URL
   */
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Extract text from PDF files
   * @param {File} file - PDF file
   * @returns {Promise<string>} Extracted text
   */
  extractPDFText: async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return '';
    }
  },

  /**
   * Extract text from images using OCR
   * @param {File} file - Image file
   * @returns {Promise<string>} Extracted text
   */
  extractImageText: async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m) // Optional: log OCR progress
      });
      return text.trim();
    } catch (error) {
      console.error('OCR text extraction failed:', error);
      return '';
    }
  },

  /**
   * Get file type category
   * @param {string} mimeType - File MIME type
   * @returns {string} File type category
   */
  getFileType: (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    return 'file';
  },

  /**
   * Delete document
   * @param {string} documentId - Document ID to delete
   * @param {Array} documents - Current documents array
   * @returns {Array} Updated documents array
   */
  deleteDocument: (documentId, documents) => {
    return documents.filter(doc => doc.id !== documentId);
  },

  /**
   * Search documents by content or metadata
   * @param {Array} documents - Documents to search
   * @param {string} query - Search query
   * @returns {Array} Matching documents
   */
  searchDocuments: (documents, query) => {
    const searchTerm = query.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.category.toLowerCase().includes(searchTerm) ||
      doc.property.toLowerCase().includes(searchTerm) ||
      (doc.content && doc.content.toLowerCase().includes(searchTerm))
    );
  }
};
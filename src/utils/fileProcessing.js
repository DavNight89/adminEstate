// utils/fileProcessing.js

export const FileTypes = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  SPREADSHEET: ['xls', 'csv'],
  PRESENTATION: ['ppt', 'pptx'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz']
};

export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (FileTypes.IMAGE.includes(fileExtension)) {
      // For images, you might want to use OCR
      resolve({ text: '', type: 'image', needsOCR: true });
    } else if (fileExtension === 'txt') {
      // Plain text files
      const reader = new FileReader();
      reader.onload = (e) => resolve({ text: e.target.result, type: 'text' });
      reader.onerror = reject;
      reader.readAsText(file);
    } else {
      // Other file types might need specialized libraries
      resolve({ text: '', type: fileExtension, needsSpecialProcessing: true });
    }
  });
};

export const generateThumbnail = (file, maxWidth = 150, maxHeight = 150) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = calculateThumbnailSize(
        img.width, 
        img.height, 
        maxWidth, 
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const calculateThumbnailSize = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
};

export const validateFileContent = async (file) => {
  const validations = [];

  // Check if file is actually an image when it claims to be
  if (file.type.startsWith('image/')) {
    try {
      await createImageBitmap(file);
      validations.push({ type: 'image_valid', passed: true });
    } catch {
      validations.push({ 
        type: 'image_valid', 
        passed: false, 
        message: 'File is corrupted or not a valid image' 
      });
    }
  }

  // Add more content validations as needed
  return validations;
};

export const compressImage = (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = calculateThumbnailSize(
        img.width, 
        img.height, 
        maxWidth, 
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: file.lastModified
        });
        resolve(compressedFile);
      }, file.type, quality);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
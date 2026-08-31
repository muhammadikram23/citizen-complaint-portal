/**
 * Utility to resize and compress user-selected image files
 * into lightweight base64 data URLs suitable for fast upload and MongoDB storage.
 *
 * @param {File} file - User selected image file
 * @param {number} maxWidth - Maximum width (default: 1280px)
 * @param {number} maxHeight - Maximum height (default: 1280px)
 * @param {number} quality - JPEG compression quality (0.1 to 1.0, default: 0.8)
 * @returns {Promise<string>} - Resolves with compressed base64 data URL
 */
export const compressImage = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file provided.'));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            width = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original base64 if canvas is unsupported
          return resolve(readerEvent.target.result);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
};

export default compressImage;

/**
 * Helper to process and normalize photos selected from the phone's gallery/camera.
 * Scales large phone photos (e.g. 10MB+ 4K photos) down to a crisp 1280px max dimension,
 * keeping aspect ratio and ensuring fast network transmission and optimal OCR accuracy.
 */

export async function processPhonePhoto(file: File, maxDimension = 1280): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file from phone'));

    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to parse image from phone'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: src, mimeType: file.type || 'image/jpeg' });
          return;
        }

        // Draw and compress with smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          dataUrl: compressedDataUrl,
          mimeType: 'image/jpeg',
        });
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}

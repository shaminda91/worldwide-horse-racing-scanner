
import { createWorker } from 'tesseract.js';

function preprocessImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const scale = Math.max(
          2,
          Math.min(4, 1800 / image.width),
        );

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }

        ctx.filter = 'grayscale(1) contrast(1.7)';
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        const pixels = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const data = pixels.data;

        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];

          const value = Math.max(
            0,
            Math.min(255, (gray - 128) * 1.7 + 128),
          );

          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        ctx.putImageData(pixels, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(
      new Error('Could not load ticket image'),
    );

    image.src = src;
  });
}

export async function readHorseTicketText(
  image: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const processedImage = await preprocessImage(image);

  const worker = await createWorker('eng', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.(message.progress);
      }
    },
  });

  try {
    const result = await worker.recognize(processedImage);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}


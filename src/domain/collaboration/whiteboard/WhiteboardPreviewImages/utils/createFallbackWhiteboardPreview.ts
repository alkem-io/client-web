/**
 * Fallback image generation in case of error
 * Excalidraw sometimes fails to export images for very big whiteboards, and that breaks the whole saving
 */
const createFallbackWhiteboardPreview = async (width: number, height: number): Promise<Blob> => {
  const t = await import('react-i18next').then(i18n => i18n.getI18n().t);

  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Fill background with light gray
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

      // Draw text
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Arial, sans-serif';

      const text = t('pages.whiteboard.previewSettings.errorGeneratingPreview') || 'Error generating preview image';
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Word wrap the text if needed
      const maxWidth = canvas.width * 0.8;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Draw each line
      const lineHeight = 24;
      const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, startY + index * lineHeight);
      });
    }

    canvas.toBlob(blob => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
};

export default createFallbackWhiteboardPreview;

import { WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';

// Theme palette tokens used for the fallback canvas, inlined to avoid value-
// importing the MUI theme (which pulls `createTheme` into the bundle). Mirrors
// src/core/ui/palette/palette.ts: background.default, divider, neutral.light.
const FALLBACK_COLORS = {
  background: '#F1F4F5',
  divider: '#D3D3D3',
  text: '#646464',
} as const;

/**
 * Fallback image generation in case of error
 * Excalidraw sometimes fails to export images for very big whiteboards
 */
const createFallbackWhiteboardPreview = async (): Promise<HTMLCanvasElement> => {
  const t = await import('react-i18next').then(i18n => i18n.getI18n().t);

  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = WhiteboardPreviewVisualDimensions.maxWidth;
    canvas.height = WhiteboardPreviewVisualDimensions.maxHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Fill background with theme background color
      ctx.fillStyle = FALLBACK_COLORS.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border with theme divider color
      ctx.strokeStyle = FALLBACK_COLORS.divider;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

      // Draw text with theme neutral color
      ctx.fillStyle = FALLBACK_COLORS.text;
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
        const testLine = `${currentLine} ${words[i]}`;
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
    resolve(canvas);
  });
};

export default createFallbackWhiteboardPreview;

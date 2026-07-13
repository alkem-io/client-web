/**
 * Draws an unread-count bubble onto the 32×32 favicon and swaps it in via the
 * `<link rel="icon">` element, restoring the original icon when cleared.
 *
 * The base image is loaded onto a canvas, a small count bubble is drawn in the
 * top-right corner, and the resulting data URL replaces the link's `href`.
 * Canvas/image work is best-effort: if it is unavailable (or the image fails to
 * load) the favicon is simply left unbadged — the title prefix still signals
 * unread, so this never errors or blocks the page (FR-011 spirit).
 */

const BASE_FAVICON_HREF = '/favicon-32x32.png';
const SIZE = 32;

let originalHref: string | null = null;

const getIconLink = (): HTMLLinkElement => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.setAttribute('sizes', '32x32');
    link.setAttribute('type', 'image/png');
    link.href = BASE_FAVICON_HREF;
    document.head.appendChild(link);
  }
  if (originalHref === null) {
    originalHref = link.getAttribute('href') || BASE_FAVICON_HREF;
  }
  return link;
};

const drawBubble = (ctx: CanvasRenderingContext2D, count: number): void => {
  const radius = 11;
  const cx = SIZE - radius;
  const cy = radius;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#e53935';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count > 9 ? '9+' : String(count), cx, cy + 1);
};

export const setFaviconBadge = (count: number): void => {
  const link = getIconLink();

  if (count <= 0) {
    clearFaviconBadge();
    return;
  }

  try {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        drawBubble(ctx, count);
        link.setAttribute('href', canvas.toDataURL('image/png'));
      } catch {
        // Best-effort — leave the favicon unbadged if canvas export is blocked.
      }
    };
    img.src = originalHref ?? BASE_FAVICON_HREF;
  } catch {
    // Best-effort — Image/canvas unavailable; the title prefix still signals unread.
  }
};

export const clearFaviconBadge = (): void => {
  if (originalHref !== null) {
    getIconLink().setAttribute('href', originalHref);
  }
};

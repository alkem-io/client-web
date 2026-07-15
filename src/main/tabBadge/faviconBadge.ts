/**
 * Draws an unread-count bubble onto the favicon and swaps it in, restoring the
 * original icon(s) when cleared.
 *
 * Two things are load-bearing here:
 *
 * 1. **All** `<link rel="icon">` candidates are replaced by a single sizeless one.
 *    The browser picks among the declared candidates by requested size (16 CSS px ×
 *    devicePixelRatio), so badging only the 32×32 link leaves 1× displays rendering
 *    the untouched 16×16 icon — the badge would simply never appear. favico.js and
 *    tinycon take the same approach.
 * 2. Draws are **generation-guarded**. The base image loads asynchronously, so a
 *    draw can resolve after the count has already changed or cleared; without the
 *    guard a stale `onload` re-badges an icon that should be clean.
 *
 * Canvas/image work is best-effort: if it is unavailable, blocked, or the image
 * fails to load, the favicon is simply left unbadged — the title prefix still
 * signals unread, so this never errors or blocks the page (FR-011 spirit).
 */

const BASE_FAVICON_HREF = '/favicon-32x32.png';
const SIZE = 32;

/** The icon links declared in index.html, detached while a badge is shown. */
let originalLinks: HTMLLinkElement[] | null = null;
/** The single replacement link carrying the badged data URL. */
let badgeLink: HTMLLinkElement | null = null;
let baseHref = BASE_FAVICON_HREF;
let baseImage: HTMLImageElement | null = null;
/** Bumped by every set/clear; a draw whose generation is stale is dropped. */
let generation = 0;

const captureOriginals = (): void => {
  if (originalLinks !== null) {
    return;
  }
  originalLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
  const preferred = originalLinks.find(link => link.getAttribute('sizes') === '32x32') ?? originalLinks[0];
  baseHref = preferred?.getAttribute('href') || BASE_FAVICON_HREF;
};

const activateBadgeLink = (): HTMLLinkElement => {
  captureOriginals();

  for (const link of originalLinks ?? []) {
    link.remove();
  }

  if (!badgeLink) {
    badgeLink = document.createElement('link');
    badgeLink.rel = 'icon';
    badgeLink.type = 'image/png';
  }
  if (!badgeLink.isConnected) {
    document.head.appendChild(badgeLink);
  }
  return badgeLink;
};

const drawBubble = (ctx: CanvasRenderingContext2D, count: number): void => {
  const label = count > 99 ? '99+' : String(count);
  const radius = 9;
  const cx = SIZE - radius - 1;
  const cy = radius + 1;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#e53935';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${label.length > 2 ? 9 : label.length > 1 ? 12 : 15}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);
};

export const setFaviconBadge = (count: number): void => {
  if (count <= 0) {
    clearFaviconBadge();
    return;
  }

  const currentGeneration = ++generation;

  try {
    const link = activateBadgeLink();

    const draw = (img: HTMLImageElement): void => {
      if (currentGeneration !== generation) {
        return; // Superseded by a later set/clear — dropping this draw.
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        drawBubble(ctx, count);
        link.setAttribute('href', canvas.toDataURL('image/png'));
      } catch {
        // Best-effort — leave the favicon unbadged if canvas export is blocked.
      }
    };

    if (baseImage?.complete && baseImage.naturalWidth > 0) {
      draw(baseImage); // Already decoded — redraw synchronously, no reload.
      return;
    }

    const img = baseImage ?? new Image();
    baseImage = img;
    img.onload = () => draw(img);
    img.onerror = () => {
      if (currentGeneration !== generation) {
        return; // Superseded — a later set/clear already owns the icon state.
      }
      // The base icon itself failed to load. activateBadgeLink() has already
      // detached the originals, so leaving badgeLink in place would show a blank
      // favicon. Restore the originals instead — best-effort, title prefix still
      // signals unread (matches the header comment's "left unbadged" intent).
      clearFaviconBadge();
    };
    img.src = baseHref;
  } catch {
    // Best-effort — Image/canvas unavailable; the title prefix still signals unread.
  }
};

export const clearFaviconBadge = (): void => {
  generation++; // Cancel any in-flight draw so it cannot re-badge a cleared icon.

  if (!badgeLink) {
    return; // Never badged — nothing to restore.
  }

  badgeLink.remove();
  for (const link of originalLinks ?? []) {
    if (!link.isConnected) {
      document.head.appendChild(link);
    }
  }
};

/**
 * Converts an HTMLCanvasElement to a Blob promisifying it to be able to await for it.
 * @param canvas
 * @param options
 * @returns
 */
export function toBlobPromise(
  canvas: HTMLCanvasElement,
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to Blob'));
        }
      },
      options.type,
      options.quality
    );
  });
}

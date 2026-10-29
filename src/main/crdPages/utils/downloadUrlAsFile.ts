/**
 * Fetches a URL as a blob and saves it under `filename`. `<a href download>` alone
 * is unreliable: browsers ignore `download` for cross-origin URLs and open the
 * file instead, which leaves the app. Rejects when the fetch fails so the caller
 * can surface its own error message.
 */
export async function downloadUrlAsFile(url: string, filename: string): Promise<void> {
  let objectUrl: string | undefined;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.status}`);
    }
    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

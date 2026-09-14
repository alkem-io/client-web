type MemoSignatureDownload = {
  url: string;
  displayName?: string | null;
};

export async function downloadMemoSignaturePdf({ url, displayName }: MemoSignatureDownload): Promise<void> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Signed PDF download failed with status ${response.status}`);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  const filename = displayName?.trim() || 'signed-copy';
  anchor.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  }
}

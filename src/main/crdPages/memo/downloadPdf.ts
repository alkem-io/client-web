export class PdfDownloadError extends Error {
  constructor(public readonly status: number) {
    super(`PDF download failed with status ${status}`);
    this.name = 'PdfDownloadError';
  }
}

export const parseContentDispositionFilename = (header: string | null): string | undefined => {
  if (!header) {
    return undefined;
  }
  // `filename*=` (RFC 5987) is ignored on purpose: the server only emits the plain ASCII parameter.
  const quoted = /(?:^|;)\s*filename="(.*?)"/i.exec(header);
  const bare = quoted ? undefined : /(?:^|;)\s*filename=([^;]+)/i.exec(header);
  const name = (quoted?.[1] ?? bare?.[1])?.trim();
  return name || undefined;
};

type PdfDownload = {
  url: string;
  // When omitted, the name comes from the response's Content-Disposition header.
  filename?: string;
};

export async function downloadPdf({ url, filename }: PdfDownload): Promise<void> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new PdfDownloadError(response.status);
  }

  const name =
    filename?.trim() || parseContentDispositionFilename(response.headers.get('content-disposition')) || 'memo';
  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  }
}

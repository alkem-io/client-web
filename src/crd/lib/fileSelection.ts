export const MAX_FILES_PER_SELECTION = 25;
export const MAX_CONCURRENT_UPLOADS = 3;

export type LeftOutReason =
  | { kind: 'limit' }
  | { kind: 'type' }
  | { kind: 'size'; maxBytes: number }
  | { kind: 'failed' };

export type LeftOutFile = { name: string; reason: LeftOutReason };

/** Upload callback a row editor receives. `silent` uploads raise no notification and reject with a
 *  `FileUploadRejection` instead of resolving to `null`. */
export type RowFileUpload = (file: File, options?: { silent?: boolean }) => Promise<string | null>;

export class FileUploadRejection extends Error {
  constructor(readonly reason: LeftOutReason) {
    super(reason.kind);
    this.name = 'FileUploadRejection';
  }
}

/** Caps a selection at `MAX_FILES_PER_SELECTION` (first files in the given order) and checks each
 *  kept file; everything left out is reported by name with its reason. */
export function selectFiles(
  files: File[],
  check: (file: File) => LeftOutReason | null
): { kept: File[]; leftOut: LeftOutFile[] } {
  const kept: File[] = [];
  const leftOut: LeftOutFile[] = [];
  files.forEach((file, index) => {
    const reason = index < MAX_FILES_PER_SELECTION ? check(file) : { kind: 'limit' as const };
    if (reason) leftOut.push({ name: file.name, reason });
    else kept.push(file);
  });
  return { kept, leftOut };
}

/** Whether the file's extension is in an `<input accept>` extension list. No list accepts all. */
export function acceptsFile(file: File, accept: string | undefined): boolean {
  if (accept === undefined) return true;
  const dot = file.name.lastIndexOf('.');
  if (dot < 0) return false;
  const extension = file.name.slice(dot).toLowerCase();
  return accept
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .includes(extension);
}

export type DocumentRow = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploaderName: string;
  uploadedAt: string; // ISO-8601
};

export type StorageViewProps = {
  documents: DocumentRow[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
};

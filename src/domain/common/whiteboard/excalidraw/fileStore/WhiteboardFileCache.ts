import type { BinaryFileDataWithUrl } from '../types';

/**
 * Simple in-memory cache for whiteboard files.
 * Responsible for storing and retrieving files with URLs.
 */
export class WhiteboardFileCache {
  private files: Record<string, BinaryFileDataWithUrl> = {};
  private version = 0;
  private listeners: Array<() => void> = [];

  get(fileId: string): BinaryFileDataWithUrl | undefined {
    return this.files[fileId];
  }

  has(fileId: string): boolean {
    return !!this.files[fileId];
  }

  set(fileId: string, file: BinaryFileDataWithUrl): void {
    this.files = { ...this.files, [fileId]: file };
    this.version++;
    this.notifyListeners();
  }

  getAll(): Record<string, BinaryFileDataWithUrl> {
    return this.files;
  }

  getAllArray(): BinaryFileDataWithUrl[] {
    return Object.values(this.files);
  }

  getVersion(): number {
    return this.version;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

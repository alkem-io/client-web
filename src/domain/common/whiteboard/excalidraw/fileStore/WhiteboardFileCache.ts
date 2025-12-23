import type { BinaryFileDataWithUrl } from '../types';

/**
 * Simple in-memory cache for whiteboard files.
 * Responsible for storing and retrieving files with URLs.
 *
 * **Lifecycle**: This cache is scoped to the component using useWhiteboardFilesManager.
 * The cache is created once per component instance and lives for the component's entire lifecycle.
 * When the component unmounts (e.g., whiteboard dialog closes), the cache is garbage collected.
 *
 * **Memory considerations**: Files contain dataURLs (base64-encoded) which can be large.
 * In typical usage, the cache holds files only while a single whiteboard dialog is open.
 * For long-running sessions with many whiteboards opened/closed sequentially, each new
 * whiteboard gets a fresh cache instance, preventing unbounded growth.
 *
 * **No manual cleanup needed**: React's component lifecycle handles cleanup automatically.
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

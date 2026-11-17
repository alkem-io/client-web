import { downloadTextFile } from '@/core/utils/downloadTextFile';

export function downloadCsv(csv: string, filename: string): void {
  downloadTextFile(csv, filename, 'text/csv;charset=utf-8');
}

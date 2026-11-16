/** Hands the browser `content` as a file named `filename` to save. */
export function downloadTextFile(content: string, filename: string, type = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

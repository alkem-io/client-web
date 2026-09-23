// Base-1024 steps with the conventional B/KB/MB labels — the convention already
// shipped in the UI and in every locale file (`comments.attachments.errorTooLarge`
// renders "{{max}} MB" off the same divisor). One formatter so the same file can't
// read "2.4 MB" in one place and "2.4 MiB" in another.
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** Pure, self-contained byte formatter — no host-app imports, usable anywhere in
 *  the design system. Returns an empty string for a missing / zero size. */
export function formatBytes(size: number): string {
  if (!size || size <= 0) {
    return '';
  }
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = size / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${BYTE_UNITS[exponent]}`;
}

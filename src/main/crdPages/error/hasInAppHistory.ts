export function hasInAppHistory(): boolean {
  return typeof window !== 'undefined' && window.history.length > 1;
}

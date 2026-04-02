const STORAGE_KEY = 'alkemio-crd-enabled';

export function useCrdEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

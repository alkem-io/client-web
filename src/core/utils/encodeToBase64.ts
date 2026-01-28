/**
 * Encodes a string to Base64 with Unicode-safe handling.
 * HTTP headers only support ISO-8859-1, so Unicode must be encoded.
 */
export const encodeToBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString);
};

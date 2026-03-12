import dayjs from 'dayjs';

/**
 * Folds a content line per RFC 5545 §3.1.
 * Lines SHOULD NOT exceed 75 octets. Folding inserts CRLF + SPACE.
 * Operates on UTF-8 byte length to handle multi-byte characters correctly.
 */
export const foldLine = (line: string): string => {
  const encoder = new TextEncoder();
  const maxFirstLine = 75;
  const maxContinuation = 74; // 75 minus the leading SPACE on continuation lines

  if (encoder.encode(line).length <= maxFirstLine) return line;

  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? maxFirstLine : maxContinuation;

    if (currentBytes + charBytes > limit) {
      parts.push(current);
      current = char;
      currentBytes = charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts.join('\r\n ');
};

/**
 * Formats a dayjs date as a UTC timestamp string for ICS (e.g. "20260305T120000Z").
 */
export const formatDateTimeUtc = (date: dayjs.Dayjs): string =>
  date
    .toDate()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

/**
 * Escapes special characters in ICS text values per RFC 5545 §3.3.11.
 */
export const escapeIcsText = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
};

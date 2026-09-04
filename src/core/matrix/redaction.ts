const SENSITIVE_PATTERNS = [
  /access_token=[^&\s]*/gi,
  /refresh_token=[^&\s]*/gi,
  /loginToken=[^&\s]*/gi,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /"access_token"\s*:\s*"[^"]*"/gi,
  /"refresh_token"\s*:\s*"[^"]*"/gi,
  /"loginToken"\s*:\s*"[^"]*"/gi,
  /"device_id"\s*:\s*"[^"]*"/gi,
];

const REPLACEMENTS: Record<string, string> = {
  access_token: 'access_token=[REDACTED]',
  refresh_token: 'refresh_token=[REDACTED]',
  loginToken: 'loginToken=[REDACTED]',
  Bearer: 'Bearer [REDACTED]',
};

const redactString = (input: string): string => {
  let result = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, match => {
      for (const [key, replacement] of Object.entries(REPLACEMENTS)) {
        if (match.startsWith(key) || match.startsWith(`"${key}"`)) {
          return match.startsWith('"') ? `"${key}": "[REDACTED]"` : replacement;
        }
      }
      return '[REDACTED]';
    });
  }
  return result;
};

const redactValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return redactString(value);
  }
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (['accessToken', 'refreshToken', 'loginToken', 'access_token', 'refresh_token'].includes(k)) {
        result[k] = '[REDACTED]';
      } else {
        result[k] = redactValue(v);
      }
    }
    return result;
  }
  return value;
};

interface BreadcrumbData {
  message?: string;
  data?: Record<string, unknown>;
}

const redactBreadcrumb = (breadcrumb: BreadcrumbData): BreadcrumbData => {
  const result: BreadcrumbData = {};
  if (breadcrumb.message !== undefined) {
    result.message = redactString(breadcrumb.message);
  }
  if (breadcrumb.data !== undefined) {
    result.data = redactValue(breadcrumb.data) as Record<string, unknown>;
  }
  return { ...breadcrumb, ...result };
};

export { redactString, redactValue, redactBreadcrumb };

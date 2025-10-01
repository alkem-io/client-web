export function getLastSubspaceNameId(params: Record<string, string | undefined>): string | undefined {
  const keys = Object.keys(params);
  const nameIdKeys = keys.filter(k => k.endsWith('NameId'));
  const lastKey = nameIdKeys[nameIdKeys.length - 1];
  return lastKey ? params[lastKey] : undefined;
}

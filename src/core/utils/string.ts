export function kebabToConstantCase(str: string): string {
  return str.replace(/-/g, '_').toUpperCase();
}

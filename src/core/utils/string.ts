export function kebabToConstantCase(str: string): string {
  return str.replace(/-/g, '_').toUpperCase();
}

/** Turns a kebab-case slug into a humanized label: each word capitalised, joined with spaces. */
export function humanizeRoleSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

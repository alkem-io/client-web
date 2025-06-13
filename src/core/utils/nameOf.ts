// Helper type: recursively builds all valid property paths as strings
type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}` | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof unknown[]>>}`
    : `${Key}`
  : never;

type Path<T> = PathImpl<T, keyof T>;

// Usage: nameOf<YourType>('property.subProperty')
export function nameOf<T>(path: Path<T>): Path<T> {
  return path;
}

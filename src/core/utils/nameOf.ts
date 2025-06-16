// Helper type: recursively builds all valid property paths as strings
// https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959#58436959
type Paths<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Paths<T[K]>}`}` }[keyof T]
  : never;

// Usage:
// type YourType = { property: { subProperty: { subSubProperty } } };
// nameOf<YourType>('property.subProperty.subSubProperty')
export function nameOf<T extends object>(path: Paths<T>): string {
  return path;
}

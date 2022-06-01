export type PossiblyUndefinedProps<T> = {
  [Key in keyof T]: T[Key] | undefined;
};

/**
 * Makes keys K of type T optional.
 * Partial<T> = Optional<T, K> when K is all keys of T
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

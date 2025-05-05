import { resources } from '../config';

// Utility type to flatten nested objects into dot-separated keys. Converts the translation JSON structure into a flat key typescript type.
type Flatten<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends object ? Flatten<T[K], `${Prefix}${K}.`> : `${Prefix}${K}`;
}[keyof T & string];

// Define TranslationKey as the flattened keys of the translation resources
type TranslationKey = Flatten<typeof resources.en.translation>;

export default TranslationKey;

import { nameIdValidator } from './nameIdValidator';

// For now it's just the same as nameIdValidator.
// It was this way. But maybe we want to filter some special words.
export const subdomainValidator = nameIdValidator;

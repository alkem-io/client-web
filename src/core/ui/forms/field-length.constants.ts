// Pulled from the server repo
export const ALT_TEXT_LENGTH = 120;
export const SMALL_TEXT_LENGTH = 128;
export const MID_TEXT_LENGTH = 512;
export const LONG_TEXT_LENGTH = 2048;
export const MARKDOWN_TEXT_LENGTH = 8000;
export const LONG_MARKDOWN_TEXT_LENGTH = 16000;
export const COMMENTS_TEXT_LENGTH = 8000;

export type MarkdownTextMaxLength = typeof MARKDOWN_TEXT_LENGTH | typeof LONG_MARKDOWN_TEXT_LENGTH;

// Client-side field limits. These mirror the server's validation where the two
// agree, and otherwise stay deliberately below it, so client validation always
// fails before the API does. They are not copied verbatim from the server repo.
export const ALT_TEXT_LENGTH = 120;
export const SMALL_TEXT_LENGTH = 128;
export const MID_TEXT_LENGTH = 512;
export const LONG_TEXT_LENGTH = 2048;
export const MARKDOWN_TEXT_LENGTH = 8000;
// 3 x the previous 16000 ceiling, which long-form content such as a pasted
// newsletter routinely exceeded. Kept below the server's own limit on
// profile.description (65568) so client validation still fires first.
export const LONG_MARKDOWN_TEXT_LENGTH = 48000;
export const COMMENTS_TEXT_LENGTH = 8000;

export type MarkdownTextMaxLength = typeof MARKDOWN_TEXT_LENGTH | typeof LONG_MARKDOWN_TEXT_LENGTH;

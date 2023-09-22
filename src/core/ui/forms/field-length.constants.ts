// Pulled from the server repo
export const TINY_TEXT_LENGTH = 16;
export const ALT_TEXT_LENGTH = 120;
export const SMALL_TEXT_LENGTH = 128;
export const MID_TEXT_LENGTH = 512;
export const LONG_TEXT_LENGTH = 2048;
export const VERY_LONG_TEXT_LENGTH = 16392; //!! TODO clean up the ones not used
export const MARKDOWN_TEXT_LENGTH = 8000;
export const UUID_LENGTH = 36;
export const NAMEID_LENGTH = 25;
export const MESSAGEID_LENGTH = 44;
export const WHITEBOARD_VALUE_LENGTH = 8388608;
export const LIFECYCLE_DEFINITION_LENGTH = 8388608;

export type MarkdownTextMaxLength = typeof MARKDOWN_TEXT_LENGTH;

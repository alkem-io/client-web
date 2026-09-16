// Client-side field limits. These mirror the server's validation where the two
// agree, and otherwise stay deliberately below it, so client validation always
// fails before the API does. They are not copied verbatim from the server repo.
//
// Every limit counts RAW MARKDOWN — the source string, not the rendered text —
// so formatting, links and inlined images all consume the budget.
//
// The server's own constants live in the server repo at
// `src/common/constants/entity.field.length.constants.ts`. The values quoted
// below are a snapshot of another repo and can drift; that file stays the
// source of truth, so check it there rather than trusting these numbers.
//   SMALL_TEXT_LENGTH 128, MID_TEXT_LENGTH 512, LONG_TEXT_LENGTH 2048,
//   LONGER_TEXT_LENGTH 8192, VERY_LONG_TEXT_LENGTH 32784,
//   HUGE_TEXT_LENGTH 65568, ALT_TEXT_LENGTH 120.
//
// Mirroring:
//   ALT_TEXT_LENGTH, SMALL_TEXT_LENGTH, MID_TEXT_LENGTH and LONG_TEXT_LENGTH
//   match the server constants of the same name exactly.
//   MARKDOWN_TEXT_LENGTH, LONG_MARKDOWN_TEXT_LENGTH and COMMENTS_TEXT_LENGTH
//   have no server counterpart — they are client-only UX ceilings chosen to
//   sit under whatever the relevant server DTO allows.
//
// The server ceilings that actually bound the markdown fields:
//   profile.description    65568 (HUGE_TEXT_LENGTH), enforced by @MaxLength on
//                          the profile create/update DTOs and persisted to a
//                          Postgres `text` column, so the database imposes no
//                          limit of its own.
//   spaceAbout.why / .who  32784 (VERY_LONG_TEXT_LENGTH), space about DTOs.
//   room message           32784 (VERY_LONG_TEXT_LENGTH), send-message DTO.
//
// Worth knowing, because it keeps getting re-derived: a post contribution
// description and a callout framing description are the SAME server field.
// Both nest UpdateProfileInput.description, so both are bounded by the same
// 65568 — which is why they share one client constant.
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

/**
 * `react-mentions` keeps two parallel representations of the same text: the
 * markup value we own (`[@John Doe](abc-123)`) and the plain text the textarea
 * actually renders (`@John Doe`). A textarea selection index always refers to
 * the plain text, so it cannot be used to splice the markup — once a mention is
 * present the two drift apart by the length of the markup scaffolding.
 *
 * The library maps between the two internally but does not export the helper,
 * hence this local implementation. It mirrors the regex `react-mentions` derives
 * from `MENTION_MARKUP` (display runs up to the `]`, id up to the `)`).
 */
export const MENTION_MARKUP = '[@__display__](__id__)';

const buildMentionPattern = () => /\[@([^\]]+?)\]\(([^)]+?)\)/g;

export type MappedIndex = {
  /** Index into the markup value — safe to splice at. */
  markupIndex: number;
  /**
   * Plain-text index the mapping resolved to. Equals the requested index unless
   * it pointed inside a mention, in which case it is snapped to the mention's
   * first character.
   */
  plainIndex: number;
};

/**
 * Translate a plain-text index (e.g. `textarea.selectionStart`) into an index
 * into the mention markup `value`.
 *
 * An index that falls inside a mention snaps to the start of that mention's
 * markup: inserting there would otherwise corrupt the display name or the id.
 */
export const mapPlainIndexToMarkupIndex = (value: string, indexInPlainText: number): MappedIndex => {
  const pattern = buildMentionPattern();
  let markupCursor = 0;
  let plainCursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    const textBefore = match.index - markupCursor;

    if (plainCursor + textBefore >= indexInPlainText) {
      return { markupIndex: markupCursor + (indexInPlainText - plainCursor), plainIndex: indexInPlainText };
    }

    plainCursor += textBefore;

    // `displayTransform` prefixes the captured display name with '@'.
    const displayLength = match[1].length + 1;

    if (plainCursor + displayLength > indexInPlainText) {
      return { markupIndex: match.index, plainIndex: plainCursor };
    }

    plainCursor += displayLength;
    markupCursor = match.index + match[0].length;
  }

  const markupIndex = Math.min(markupCursor + (indexInPlainText - plainCursor), value.length);
  return { markupIndex, plainIndex: indexInPlainText };
};

export interface CursorPositionInMarkdown {
  markdown: number;
  plainText: number;
}

export interface MentionMatch {
  offset: number;
  markdown: string;
  plainText: string;
}

/**
 * Finds cursor position inside the Markdown string based its position in its rendered (plaintext) form.
 * The definition of Markdown here is limited to User mentions in the form of Markdown links.
 * @returns { markdown, plainText } - you may want to adjust plainText position if the cursor happened
 * to be inside the mention.
 * @param markdownString
 * @param plainTextPosition
 * @param getCursorPositionInMention - a callback that computes cursor position inside a mention based on
 * 1. MentionMatch: `mention.offset` is the global position of the mention in the Markdown string
 *                  `mention.markdown` is a string containing Markdown form of the mention
 *                  `mention.plainText` is a string containing plain text form of the mention
 * 2. relativeOffset - cursor position relative to the start of the plaintext mention
 * 3. globalOffset - cursor position relative to the start of the string (plaintext)
 */
export const findCursorPositionInMarkdown = (
  markdownString: string,
  plainTextPosition: number,
  getCursorPositionInMention = getCursorPositionInMentionDefault
): CursorPositionInMarkdown => {
  const regexp = /\[([^\]]+)\]\([^)]+\)/g;

  let match: RegExpExecArray | null = null;
  let searchOffset = plainTextPosition;
  let markdownLength = 0;

  while ((match = regexp.exec(markdownString))) {
    const mention: MentionMatch = {
      offset: match.index,
      markdown: match[0],
      plainText: match[1],
    };
    if (markdownLength + searchOffset <= mention.offset) {
      const markdownPosition = markdownLength + searchOffset;
      return {
        markdown: markdownPosition,
        plainText: plainTextPosition,
      };
    }
    searchOffset -= mention.offset - markdownLength;
    markdownLength = mention.offset;
    if (searchOffset <= mention.plainText.length) {
      return getCursorPositionInMention(mention, searchOffset, plainTextPosition);
    }
    searchOffset -= mention.plainText.length;
    markdownLength = mention.offset + mention.markdown.length;
  }

  return {
    markdown: markdownLength + searchOffset,
    plainText: plainTextPosition,
  };
};

const getCursorPositionInMentionDefault = (
  mention: MentionMatch,
  relativeOffset: number,
  globalOffset: number
): CursorPositionInMarkdown => {
  return {
    markdown: mention.offset + relativeOffset,
    plainText: globalOffset,
  };
};

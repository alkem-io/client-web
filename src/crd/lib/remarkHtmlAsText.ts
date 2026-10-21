import type { Root } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Parses raw HTML in markdown as the literal text it was typed as. For plain
 * text that is only ever markdown — a chat message — a `<word>` is something the
 * writer typed to be read, not an element: rendered as HTML it is either dropped
 * by the sanitiser or turned into formatting the writer never asked for. Turning
 * HTML off in the parser (rather than converting HTML nodes afterwards) also
 * keeps a line that starts with a tag from swallowing the markdown after it.
 */
export const remarkHtmlAsText: Plugin<[], Root> = function () {
  const data = this.data();
  data.micromarkExtensions ??= [];
  data.micromarkExtensions.push({ disable: { null: ['htmlFlow', 'htmlText'] } });
};

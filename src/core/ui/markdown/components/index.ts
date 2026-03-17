import MarkdownBlockquote from './MarkdownBlockquote';
import MarkdownCode from './MarkdownCode';
import MarkdownHeading from './MarkdownHeading';
import MarkdownInlineCode from './MarkdownInlineCode';
import MarkdownLink from './MarkdownLink';
import createMarkdownList from './MarkdownList';
import MarkdownListItem from './MarkdownListItem';
import MarkdownMedia from './MarkdownMedia';
import MarkdownParagraph from './MarkdownParagraph';

const headings = {
  h1: MarkdownHeading,
  h2: MarkdownHeading,
  h3: MarkdownHeading,
  h4: MarkdownHeading,
  h5: MarkdownHeading,
  h6: MarkdownHeading,
} as const;

const components = {
  ...headings,
  a: MarkdownLink,
  iframe: MarkdownMedia,
  img: MarkdownMedia,
  p: MarkdownParagraph,
  ul: createMarkdownList('ul'),
  ol: createMarkdownList('ol'),
  li: MarkdownListItem,
  blockquote: MarkdownBlockquote,
  pre: MarkdownCode, // Block code (code blocks)
  code: MarkdownInlineCode, // Inline code (code snippets)
} as const;

export default components;

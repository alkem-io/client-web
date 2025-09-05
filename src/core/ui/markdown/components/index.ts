import MarkdownHeading from './MarkdownHeading';
import MarkdownParagraph from './MarkdownParagraph';
import MarkdownMedia from './MarkdownMedia';
import MarkdownLink from './MarkdownLink';
import MarkdownListItem from './MarkdownListItem';
import createMarkdownList from './MarkdownList';
import MarkdownBlockquote from './MarkdownBlockquote';
import MarkdownCode from './MarkdownCode';
import MarkdownInlineCode from './MarkdownInlineCode';

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

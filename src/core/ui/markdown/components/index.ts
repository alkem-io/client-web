import MarkdownHeading from './MarkdownHeading';
import MarkdownParagraph from './MarkdownParagraph';
import MarkdownMedia from './MarkdownMedia';
import MarkdownLink from './MarkdownLink';
import MarkdownListItem from './MarkdownListItem';
import createMarkdownList from './MarkdownList';
import MarkdownBlockquote from './MarkdownBlockquote';
import MarkdownCode from './MarkdownCode';

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
  code: MarkdownCode,
} as const;

export default components;

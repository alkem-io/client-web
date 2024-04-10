import MarkdownHeading from './MarkdownHeading';
import MarkdownParagraph from './MarkdownParagraph';
import MarkdownMedia from './MarkdownMedia';
import MarkdownLink from './MarkdownLink';
import MarkdownListItem from './MarkdownListItem';
import createMarkdownList from './MarkdownList';

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
} as const;

export default components;

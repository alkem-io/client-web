import MarkdownHeading from './MarkdownHeading';
import MarkdownParagraph from './MarkdownParagraph';
import MarkdownMedia from './MarkdownMedia';
import MarkdownLink from './MarkdownLink';
import MarkdownList from './MarkdownList';
import MarkdownListItem from './MarkdownListItem';

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
  ul: MarkdownList,
  li: MarkdownListItem,
} as const;

export default components;

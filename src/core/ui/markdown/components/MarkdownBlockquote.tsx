import createMarkdownComponent from '@/core/ui/markdown/components/MarkdownComponent';

const Base = createMarkdownComponent('blockquote');

const MarkdownBlockquote = (props: { children?: React.ReactNode }) => {
  return <Base sx={{ borderLeft: '4px solid', borderColor: 'divider', pl: 2, ml: 0 }} {...props} />;
};

export default MarkdownBlockquote;

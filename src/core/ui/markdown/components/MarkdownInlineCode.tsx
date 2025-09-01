import createMarkdownComponent from '@/core/ui/markdown/components/MarkdownComponent';

const Base = createMarkdownComponent('code');

const MarkdownInlineCode = (props: { children?: React.ReactNode }) => {
  return (
    <Base
      sx={{
        backgroundColor: 'rgba(175, 184, 193, 0.2)',
        borderRadius: '0.25rem',
        padding: '0.125rem 0.25rem',
        fontSize: '0.875em',
        fontFamily: 'monospace',
      }}
      {...props}
    />
  );
};

export default MarkdownInlineCode;

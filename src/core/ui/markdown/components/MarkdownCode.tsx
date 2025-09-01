import createMarkdownComponent from '@/core/ui/markdown/components/MarkdownComponent';

const Base = createMarkdownComponent('pre');

const MarkdownCode = (props: { children?: React.ReactNode }) => {
  return (
    <Base
      sx={{ background: 'gray', borderRadius: '0.5rem', color: 'white', margin: '1.5rem 0', padding: '0.75rem 1rem' }}
      {...props}
    />
  );
};

export default MarkdownCode;

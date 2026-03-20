import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

const ActivitySubjectMarkdown = ({ children }: { children: string }) => (
  <WrapperMarkdown plain={true} card={true} caption={true}>
    {children}
  </WrapperMarkdown>
);

export default ActivitySubjectMarkdown;

import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

const ActivitySubjectMarkdown = ({ children }: { children: string }) => (
  <WrapperMarkdown plain card caption>
    {children}
  </WrapperMarkdown>
);

export default ActivitySubjectMarkdown;

import React from 'react';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';

interface ActivitySubjectMarkdownProps {
  children: string;
}

const ActivitySubjectMarkdown = ({ children }: ActivitySubjectMarkdownProps) => {
  return (
    <WrapperMarkdown plain card caption>
      {children}
    </WrapperMarkdown>
  );
};

export default ActivitySubjectMarkdown;

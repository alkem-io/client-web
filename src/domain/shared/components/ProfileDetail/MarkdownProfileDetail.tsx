import React, { FC } from 'react';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '../../../../core/ui/typography';

interface MarkdownProfileDetailProps {
  title: string;
  value?: string;
}

const MarkdownProfileDetail: FC<MarkdownProfileDetailProps> = ({ title, value = '' }) => {
  return (
    <>
      <BlockTitle>{title}</BlockTitle>
      <WrapperMarkdown>{value}</WrapperMarkdown>
    </>
  );
};

export default MarkdownProfileDetail;

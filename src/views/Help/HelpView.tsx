import React, { FC } from 'react';
import { Loading } from '../../common/components/core';
import WrapperMarkdown, { MarkdownProps } from '../../common/components/core/WrapperMarkdown';
import rehypeRaw from 'rehype-raw';
import { Box } from '@mui/material';

interface HelpViewProps {
  helpTextMd: string | undefined;
  isLoading: boolean;
}

const HelpView: FC<HelpViewProps> = ({ helpTextMd, isLoading }) => {
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box marginTop={2}>
      <WrapperMarkdown rehypePlugins={[rehypeRaw] as MarkdownProps['rehypePlugins']}>{helpTextMd!}</WrapperMarkdown>
    </Box>
  );
};

export default HelpView;

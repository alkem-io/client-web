import React, { FC } from 'react';
import { Loading } from '../../common/components/core';
import Markdown, { MarkdownProps } from '../../common/components/core/Markdown';
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
      <Markdown rehypePlugins={[rehypeRaw] as MarkdownProps['rehypePlugins']}>{helpTextMd!}</Markdown>
    </Box>
  );
};

export default HelpView;

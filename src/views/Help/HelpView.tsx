import React, { FC } from 'react';
import { Loading } from '../../components/core';
import Markdown, { MarkdownProps } from '../../components/core/Markdown';
import rehypeRaw from 'rehype-raw';
import { Box } from '@mui/material';

interface HelpViewProps {
  helpTextMd: string | undefined;
  isLoading: boolean;
}

const Image: FC<{ node: any }> = ({ node, ...props }) => {
  return <Box component="img" maxWidth="100%" {...props} />;
};

const components = {
  img: Image,
};

const HelpView: FC<HelpViewProps> = ({ helpTextMd, isLoading }) => {
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Markdown components={components} rehypePlugins={[rehypeRaw] as MarkdownProps['rehypePlugins']}>
      {helpTextMd!}
    </Markdown>
  );
};

export default HelpView;

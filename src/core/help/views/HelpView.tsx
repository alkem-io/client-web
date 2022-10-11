import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import rehypeRaw from 'rehype-raw';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Loading } from '../../../common/components/core';
import WrapperMarkdown, { MarkdownProps } from '../../../common/components/core/WrapperMarkdown';

interface HelpViewProps {
  helpTextMd: string | undefined;
  error?: Error;
  isLoading: boolean;
}

const HelpView: FC<HelpViewProps> = ({ helpTextMd, isLoading, error }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Typography>{t('common.error-generic')}</Typography>;
  }

  return (
    <Box marginTop={2}>
      <WrapperMarkdown rehypePlugins={[rehypeRaw] as MarkdownProps['rehypePlugins']}>{helpTextMd!}</WrapperMarkdown>
    </Box>
  );
};

export default HelpView;

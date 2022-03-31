import React, { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loading } from '../../components/core';

interface HelpViewProps {
  helpTextMd: string | undefined;
  isLoading: boolean;
}

const HelpView: FC<HelpViewProps> = ({ helpTextMd, isLoading }) => {
  if (isLoading) {
    return <Loading />;
  }

  return <ReactMarkdown>{helpTextMd!}</ReactMarkdown>;
};

export default HelpView;

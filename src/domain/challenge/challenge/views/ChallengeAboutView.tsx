/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { AboutSection } from '../../common/tabs/AboutSection';

interface ChallengeAboutViewProps {
  name?: string;
  tagline?: string;
  tags?: string[];
  who?: string;
  vision?: string;
  loading: boolean | undefined;
  error?: ApolloError;
}

export const ChallengeAboutView: FC<ChallengeAboutViewProps> = ({
  name = '',
  tagline = '',
  tags = [],
  who = '',
  vision = '',
  loading,
  error,
}) => {
  return null;
  /*return (
    <AboutSection
      infoBlockTitle={name}
      infoBlockText={tagline}
      tags={tags}
      who={who}
      vision={vision}
      loading={loading}
      error={error}
    />
  );*/
};

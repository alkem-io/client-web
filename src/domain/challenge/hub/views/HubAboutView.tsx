import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { AboutSection } from '../../../../common/components/composite/sections/about/AboutSection';

interface HubAboutViewProps {
  name?: string;
  tagline?: string;
  tags?: string[];
  who?: string;
  vision?: string;
  loading: boolean | undefined;
  error?: ApolloError
}

export const HubAboutView: FC<HubAboutViewProps> = ({
  name = '', tagline = '', tags = [], who = '', vision = '',
  loading, error
}) => {
  return (
    <AboutSection
      infoBlockTitle={name}
      infoBlockText={tagline}
      tags={tags}
      who={who}
      vision={vision}
      loading={loading}
      error={error}
    />
  );
};

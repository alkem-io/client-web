import React, { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import { DEFAULT_BANNER_URL } from '../../../shared/components/PageHeader/JourneyPageBanner';
import hexToRGBA from '../../../../common/utils/hexToRGBA';
import PageContent from '../../../../core/ui/content/PageContent';
import { PageTitle, Tagline } from '../../../../core/ui/typography';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';

// This is a helper function to build a CSS rule with a background gradient + the background image
// The returned result will be something like: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%), url('...'), #FFF
function gradientBuilder(
  angle: number,
  steps: { color: string; opacity: number; position: number }[],
  backgroundImageUrl: string,
  failsafeBackgroundColor: string
) {
  return (
    `linear-gradient(${angle}deg, ` +
    steps.map(step => hexToRGBA(step.color, step.opacity) + ` ${step.position}%`).join(', ') +
    `), url('${backgroundImageUrl}'), ` +
    `${failsafeBackgroundColor}`
  );
}

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.neutralLight.main,
  // position: 'relative',
  background: gradientBuilder(
    90,
    [
      { color: theme.palette.neutralLight.main, opacity: 1, position: 0 },
      { color: theme.palette.neutralLight.main, opacity: 0.9, position: 50 },
      { color: theme.palette.neutralLight.main, opacity: 0, position: 100 },
    ],
    DEFAULT_BANNER_URL,
    theme.palette.neutralLight.main
  ),
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

export interface InnovationPackBannerProps {
  displayName: ReactNode;
  tagline: ReactNode;
  providerDisplayName: string;
  providerUri: string;
}

const InnovationPackBanner = ({
  displayName,
  tagline,
  providerDisplayName,
  providerUri,
}: InnovationPackBannerProps) => {
  return (
    <Root>
      <PageContent column background="none">
        <PageTitle>{displayName}</PageTitle>
        <Tagline>{tagline}</Tagline>
        <ContributorCardHorizontal
          profile={{
            displayName: providerDisplayName,
          }}
          url={providerUri}
        />
      </PageContent>
    </Root>
  );
};

export default InnovationPackBanner;

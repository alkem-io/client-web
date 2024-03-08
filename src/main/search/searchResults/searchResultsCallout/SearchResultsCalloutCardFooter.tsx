import { Box } from '@mui/material';
import CardMatchedTerms from '../../../../core/ui/card/CardMatchedTerms';
import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';
import journeyIcon from '../../../../domain/shared/components/JourneyIcon/JourneyIcon';
import { CONTRIBUTION_ICON } from '../../../../domain/collaboration/callout/calloutCard/calloutIcons';
import React, { useMemo } from 'react';
import { CalloutContributionType } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import { LibraryBooksOutlined } from '@mui/icons-material';

export interface SearchResultsCalloutCardFooterProps {
  callout: CalloutContributionsProps['callout'];
  matchedTerms: string[];
  journeyTypeName: JourneyTypeName;
  journeyDisplayName: string;
}

interface CalloutContribution {
  link?: Identifiable;
  post?: Identifiable;
  whiteboard?: Identifiable;
}

interface CalloutContributionsProps {
  callout: {
    contributionPolicy: {
      allowedContributionTypes: CalloutContributionType[];
    };
    contributions: CalloutContribution[];
    comments: {
      messagesCount: number;
    };
  };
}

const calloutContributionField: Record<CalloutContributionType, keyof CalloutContribution> = {
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
};

const CalloutContributions = ({ callout }: CalloutContributionsProps) => {
  const contributionsCount = useMemo(() => {
    return callout.contributions.reduce((count, contribution) => {
      for (const [type, field] of Object.entries(calloutContributionField) as [
        CalloutContributionType,
        keyof CalloutContribution
      ][]) {
        if (contribution[field]) {
          count.set(type, (count.get(type) ?? 0) + 1);
        }
      }
      return count;
    }, new Map<CalloutContributionType, number>());
  }, [callout]);

  return (
    <Box flexShrink={0} display="flex" gap={1}>
      {Array.from(contributionsCount).map(([type, count]) => {
        const Icon = CONTRIBUTION_ICON[type];

        return (
          <Caption display="flex" alignItems="center" gap={0.5} key={type}>
            <Icon fontSize="small" />
            {count}
          </Caption>
        );
      })}
      {callout.comments.messagesCount > 0 && (
        <Caption display="flex" alignItems="center" gap={0.5}>
          <LibraryBooksOutlined fontSize="small" />
          {callout.comments.messagesCount}
        </Caption>
      )}
    </Box>
  );
};

const SearchResultsCalloutCardFooter = ({
  callout,
  journeyDisplayName,
  journeyTypeName,
  matchedTerms,
}: SearchResultsCalloutCardFooterProps) => {
  const JourneyIcon = journeyIcon[journeyTypeName];

  return (
    <Gutters padding={1} gap={1}>
      <Box display="flex">
        <Caption display="flex" alignItems="center" gap={1} flexGrow={1} flexShrink={1} minWidth={0}>
          <JourneyIcon fontSize="small" color="primary" />
          {journeyDisplayName}
        </Caption>
        <CalloutContributions callout={callout} />
      </Box>
      <CardMatchedTerms tags={matchedTerms} />
    </Gutters>
  );
};

export default SearchResultsCalloutCardFooter;

import { Box } from '@mui/material';
import { spaceLevelIcon } from '@/domain/space/icons/SpaceIconByLevel';
import { contributionIcons } from '@/domain/collaboration/callout/icons/calloutIcons';
import React, { useMemo } from 'react';
import { CalloutContributionType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { LibraryBooksOutlined } from '@mui/icons-material';
import CardMatchedTerms from '@/core/ui/card/CardMatchedTerms';
import RouterLink from '@/core/ui/link/RouterLink';

export interface SearchResultsCalloutCardFooterProps {
  callout: CalloutContributionsProps['callout'];
  matchedTerms?: string[];
  space?: {
    about: {
      profile: {
        displayName: string;
        url: string;
      };
    };
    level: SpaceLevel;
  };
}

interface CalloutContribution {
  link?: Identifiable;
  post?: Identifiable;
  whiteboard?: Identifiable;
  memo?: Identifiable;
}

interface CalloutContributionsProps {
  callout: {
    contributions: CalloutContribution[];
    comments?: {
      messagesCount: number;
    };
  };
}

const calloutContributionField: Record<CalloutContributionType, keyof CalloutContribution> = {
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
  [CalloutContributionType.Memo]: 'memo',
};

const CalloutContributions = ({ callout }: CalloutContributionsProps) => {
  const contributionsCount = useMemo(() => {
    return callout.contributions.reduce((count, contribution) => {
      for (const [type, field] of Object.entries(calloutContributionField) as [
        CalloutContributionType,
        keyof CalloutContribution,
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
        const Icon = contributionIcons[type];

        return (
          <Caption display="flex" alignItems="center" gap={0.5} key={type}>
            <Icon fontSize="small" />
            {count}
          </Caption>
        );
      })}
      {callout.comments && callout.comments.messagesCount > 0 && (
        <Caption display="flex" alignItems="center" gap={0.5}>
          <LibraryBooksOutlined fontSize="small" />
          {callout.comments.messagesCount}
        </Caption>
      )}
    </Box>
  );
};

const SearchResultsCalloutCardFooter = ({ callout, matchedTerms, space }: SearchResultsCalloutCardFooterProps) => {
  const SpaceIcon = space && spaceLevelIcon[space.level];

  return (
    <Gutters padding={1} gap={1}>
      <Box display="flex">
        {space && (
          <Caption
            component={RouterLink}
            to={space.about.profile.url}
            display="flex"
            alignItems="center"
            gap={1}
            flexGrow={1}
            flexShrink={1}
            minWidth={0}
          >
            {SpaceIcon && <SpaceIcon fontSize="small" color="primary" />}
            {space.about.profile.displayName}
          </Caption>
        )}
        <CalloutContributions callout={callout} />
      </Box>
      {matchedTerms && <CardMatchedTerms tags={matchedTerms} />}
    </Gutters>
  );
};

export default SearchResultsCalloutCardFooter;

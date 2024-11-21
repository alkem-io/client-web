import ContributeCard, { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle } from '@/core/ui/typography';
import LocationCardSegment from '@/core/ui/location/LocationCardSegment';
import { ReactNode, useState } from 'react';
import CardTags from '@/core/ui/card/CardTags';
import RouterLink from '@/core/ui/link/RouterLink';
import ExpandableCardFooter from '@/core/ui/card/ExpandableCardFooter';
import CardBanner from '@/core/ui/card/CardImageHeader';
import JourneyCardDescription from '@/domain/journey/common/JourneyCard/JourneyCardDescription';

export interface ContributorCardProps extends ContributeCardProps {
  displayName: string;
  description?: string;
  avatarUri?: string;
  city?: string;
  country?: string;
  tags: string[];
  matchedTerms?: string[];
  userUri: string;
  actions?: ReactNode;
  headerActions?: ReactNode;
  bannerOverlay?: ReactNode;
}

const ContributorCard = ({
  displayName,
  description,
  avatarUri,
  city,
  country,
  tags,
  matchedTerms,
  userUri,
  actions,
  headerActions,
  bannerOverlay,
  ...containerProps
}: ContributorCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  // const Tags = matchedTerms ? CardMatchedTerms : CardTags;

  const tagsElement = <></>; //<Tags tags={matchedTerms ?? tags} marginTop={gutters()} />;

  return (
    <>
      <ContributeCard {...containerProps}>
        <Box component={RouterLink} to={userUri} display="flex" flexDirection="column" gap={gutters()}>
          <CardBanner src={avatarUri} alt={displayName} overlay={bannerOverlay} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            paddingLeft={gutters()}
            paddingRight={0.5}
            height={gutters()}
            gap={0.5}
          >
            <BlockTitle noWrap>{displayName}</BlockTitle>
            {headerActions}
          </Box>
        </Box>
        <Box onClick={toggleExpanded} sx={{ cursor: 'pointer' }} paddingBottom={gutters(0.5)}>
          <LocationCardSegment city={city} countryCode={country} paddingX={gutters()} />
          <ExpandableCardFooter
            tags={tagsElement}
            expanded={isExpanded}
            paddingLeft={gutters()}
            expansion={
              <>
                {description && <JourneyCardDescription rows={3}>{description}</JourneyCardDescription>}
                {matchedTerms ? <CardTags tags={tags} rows={3} disableIndentation /> : undefined}
              </>
            }
          />
        </Box>
      </ContributeCard>
    </>
  );
};

export default ContributorCard;

import { Box, SvgIconProps } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import CardHeader from '@/core/ui/card/CardHeader';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import ContributeCard from '@/core/ui/card/ContributeCard';
import RouterLink from '@/core/ui/link/RouterLink';

export interface SearchBaseContributionCardProps {
  icon: React.ComponentType<SvgIconProps>;
  url: string;
  name: string;
  author?: string | undefined;
  matchedTerms: string[];
  tags?: string[];
}

const SearchBaseContributionCard: FC<PropsWithChildren<SearchBaseContributionCardProps>> = ({
  icon,
  name,
  author: label,
  url,
  children,
}) => {
  return (
    <ContributeCard>
      <Box component={RouterLink} to={url}>
        <CardHeader title={name} iconComponent={icon}>
          <CardHeaderCaption>{label}</CardHeaderCaption>
        </CardHeader>
      </Box>
      {children}
      {/*<CardFooter paddingX={gutters(1)} marginBottom={gutters(1.5)}>
        <CardMatchedTerms tags={matchedTerms} />
      </CardFooter>
      */}
    </ContributeCard>
  );
};

export default SearchBaseContributionCard;

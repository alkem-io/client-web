import { Box, SvgIconProps } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import CardFooter from '../../../../../core/ui/card/CardFooter';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardMatchedTerms from '../../../../../core/ui/card/CardMatchedTerms';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { gutters } from '../../../../../core/ui/grid/utils';

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
  matchedTerms,
  url,
  children,
}) => {
  return (
    <ContributeCard>
      <Box component={RouterLink} to={url}>
        <CardHeader title={name} iconComponent={icon}>
          <CardHeaderCaption noWrap>{label}</CardHeaderCaption>
        </CardHeader>
      </Box>
      {children}
      <CardFooter paddingX={gutters(1)} marginBottom={gutters(1.5)}>
        <CardMatchedTerms tags={matchedTerms} />
      </CardFooter>
    </ContributeCard>
  );
};

export default SearchBaseContributionCard;

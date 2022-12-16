import React, { FC } from 'react';
import { SvgIconProps, Box } from '@mui/material';
import { SearchBaseJourneyCard, SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';
import { ClampedTypography } from '../ClampedTypography';

export type SearchJourneyWithParentImplProps = Omit<SearchJourneyWithParentCardProps, 'icon' | 'parentIcon'>;
interface SearchJourneyWithParentCardProps extends SearchBaseJourneyCardProps {
  parentIcon: React.ComponentType<SvgIconProps>;
  parentName: string;
}

const SearchJourneyWithParentCard: FC<SearchJourneyWithParentCardProps> = ({
  parentIcon: ParentIcon,
  parentName,
  ...rest
}) => {
  return (
    <SearchBaseJourneyCard {...rest}>
      <Box sx={{ display: 'flex', alignItems: 'center', paddingTop: '14px' }}>
        {ParentIcon && <ParentIcon fontSize="small" sx={{ mr: 0.5 }} />}
        {parentName && (
          <ClampedTypography clamp={1} variant="caption" sx={{ textTransform: 'Uppercase' }}>
            {parentName}
          </ClampedTypography>
        )}
      </Box>
    </SearchBaseJourneyCard>
  );
};

export default SearchJourneyWithParentCard;

import React from 'react';
import { gutters } from '../grid/utils';
import TagsComponent, { TagsComponentProps } from '../../../domain/shared/components/TagsComponent/TagsComponent';
import { Caption } from '../typography';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CardTagsProps extends TagsComponentProps {
  rows?: number;
  matchedTerms?: boolean;
}

const CardMatchedTerms = ({ rows = 1, visibility, ...props }: CardTagsProps) => {
  const heightGutters = rows + (rows - 1) * 0.5;

  const { t } = useTranslation();

  return (
    <Box visibility={visibility}>
      <Caption paddingY={0.5}>{t('components.search-cards.matched-terms')}</Caption>
      <TagsComponent variant="outlined" height={gutters(heightGutters)} color="primary" {...props} />
    </Box>
  );
};

export default CardMatchedTerms;

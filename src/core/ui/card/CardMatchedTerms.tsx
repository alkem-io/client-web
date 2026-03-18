import { Box, type BoxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TagsComponent, { type TagsComponentProps } from '@/domain/shared/components/TagsComponent/TagsComponent';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface CardMatchedTermsProps extends BoxProps, Pick<TagsComponentProps, 'tags'> {
  rows?: number;
}

const CardMatchedTerms = ({ tags, rows = 1, ...containerProps }: CardMatchedTermsProps) => {
  const heightGutters = rows + (rows - 1) * 0.5;

  const { t } = useTranslation();

  return (
    <Box {...containerProps}>
      <Caption paddingY={0.5}>{t('components.search-cards.matched-terms')}</Caption>
      <TagsComponent tags={tags} variant="outlined" height={gutters(heightGutters)} color="primary" />
    </Box>
  );
};

export default CardMatchedTerms;

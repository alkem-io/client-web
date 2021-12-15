import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorCard, {
  ContributorCardProps,
} from '../../components/composite/common/cards/ContributorCard/ContributorCard';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';

const ASSOCIATE_CARDS_COUNT = 10;

interface AssociatesViewProps {
  associates: ContributorCardProps[];
  count?: number;
  perRow?: 1 | 2 | 3 | 4 | 6 | 12;
}

export const AssociatesView: FC<AssociatesViewProps> = ({ associates, count = ASSOCIATE_CARDS_COUNT, perRow = 6 }) => {
  const { t } = useTranslation();

  const columnWidth = 12 / perRow;

  return (
    <ProfileCard
      title={t('components.associates.title', { count: associates.length })}
      helpText={t('components.associates.help')}
    >
      <Grid container spacing={2}>
        {associates.slice(0, count).map((x, i) => (
          <Grid key={i} item xs={columnWidth}>
            <ContributorCard {...x} />
          </Grid>
        ))}
        <Grid item container justifyContent="flex-end">
          {/* Hide untill the search page is ready. */}
          {/*
            <Link component={RouterLink} to="/user/search">
              {t('buttons.see-more')}
            </Link> */}
        </Grid>
      </Grid>
    </ProfileCard>
  );
};
export default AssociatesView;

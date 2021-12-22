import { Grid, Link } from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorCard, {
  ContributorCardProps,
} from '../../components/composite/common/cards/ContributorCard/ContributorCard';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';

const ASSOCIATE_CARDS_COUNT = 12;

interface AssociatesViewProps {
  associates: ContributorCardProps[];
  count?: number;
  perRow?: 1 | 2 | 3 | 4 | 6 | 12;
}

export const AssociatesView: FC<AssociatesViewProps> = ({ associates, count = ASSOCIATE_CARDS_COUNT, perRow = 6 }) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const columnWidth = 12 / perRow;
  const usersCount = associates.length - count;

  const associatesToShow = useMemo(
    () => (showAll ? associates : associates.slice(0, count)),
    [associates, count, showAll]
  );

  return (
    <ProfileCard
      title={t('components.associates.title', { count: associates.length })}
      helpText={t('components.associates.help')}
    >
      <Grid container spacing={2}>
        {associatesToShow.map((x, i) => (
          <Grid key={i} item xs={columnWidth}>
            <ContributorCard {...x} />
          </Grid>
        ))}
        <Grid item container justifyContent="flex-end">
          {usersCount > 0 && (
            <Link component="button" onClick={() => setShowAll(oldValue => !oldValue)}>
              {!showAll && t('associates-view.more', { count: usersCount })}
              {showAll && t('associates-view.less')}
            </Link>
          )}
        </Grid>
      </Grid>
    </ProfileCard>
  );
};
export default AssociatesView;

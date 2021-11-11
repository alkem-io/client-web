import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AssociateCard } from '../../components/composite/common/cards/AssociateCard/AssociateCard';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import { UserCardProps } from '../../components/composite/common/cards/user-card/UserCard';

const ASSOCIATE_CARDS_COUNT = 10;

interface AssociatesViewProps {
  associates: UserCardProps[];
}

export const AssociatesView: FC<AssociatesViewProps> = ({ associates }) => {
  const { t } = useTranslation();

  return (
    <ProfileCard
      title={t('components.associates.title', { count: associates.length })}
      helpText={t('components.associates.help')}
    >
      <Grid item container spacing={2}>
        {associates.slice(0, ASSOCIATE_CARDS_COUNT).map((x, i) => (
          <Grid key={i} item>
            <AssociateCard {...x} />
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

import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarsProvider } from '../../../../context/AvatarsProvider';
import { User } from '../../../../models/graphql-schema';
import { buildUserProfileUrl } from '../../../../utils/urlBuilders';
import { AssociateCard } from '../cards';
import DashboardGenericSection from './DashboardGenericSection';

export interface DashboardCommunitySectionV2Props {
  members: User[];
}

const MEMBERS_NUMBER_IN_SECTION = 12;

const DashboardCommunitySectionV2: FC<DashboardCommunitySectionV2Props> = ({ members }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={t('dashboard-community-section.title')}
      navText={t('buttons.see-all')}
      navLink={'community'}
    >
      <AvatarsProvider users={members} count={MEMBERS_NUMBER_IN_SECTION}>
        {populated => (
          <Grid container spacing={2}>
            {populated.map((x, i) => (
              <Grid key={i} item xs={3}>
                <AssociateCard
                  avatarSrc={x.profile?.avatar || ''}
                  displayName={x.displayName}
                  tags={[]}
                  url={buildUserProfileUrl(x.nameID)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </AvatarsProvider>
    </DashboardGenericSection>
  );
};
export default DashboardCommunitySectionV2;

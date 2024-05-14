import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { VirtualContributorQuery } from '../../../../core/apollo/generated/graphql-schema';
import ProfileDetail from '../../profile/ProfileDetail/ProfileDetail';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

interface Props {
  virtualContributor: VirtualContributorQuery['virtualContributor'] | undefined;
}

export const VCProfileView: FC<Props> = ({ virtualContributor }) => {
  const { t } = useTranslation();
  const description = virtualContributor?.profile?.description;

  return (
    <PageContentBlock>
      <Grid item>
        <ProfileDetail
          title={t('components.profile.fields.description.title')}
          value={description}
          aria-label="description"
        />
      </Grid>
    </PageContentBlock>
  );
};

export default VCProfileView;

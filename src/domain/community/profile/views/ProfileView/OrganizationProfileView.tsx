import React, { FC } from 'react';
import { Box, CardContent, Grid, Link, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '../../ProfileDetail/ProfileDetail';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import OrganizationVerifiedStatus from '../../../organization/organizationVerifiedStatus/OrganizationVerifiedStatus';
import { Location } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';

export interface OrganizationProfileViewEntity {
  displayName: string;
  settingsUrl: string;
  settingsTooltip: string;
  location?: Location;
  bio?: string;
  tagsets: { name: string; tags: string[] }[];
  links: string[];
  verified?: boolean;
}

interface OrganizationProfileViewProps {
  entity: OrganizationProfileViewEntity;
  permissions: {
    canEdit: boolean;
  };
}

const VerifiedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(3),
  top: theme.spacing(3),
}));

export const OrganizationProfileView: FC<OrganizationProfileViewProps> = ({ entity }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <CardContent sx={{ position: 'relative' }}>
        <VerifiedBadge>
          {entity.verified !== undefined && (
            <OrganizationVerifiedStatus
              verified={entity.verified}
              helpText={t('pages.organization.verified-status.help')}
            />
          )}
        </VerifiedBadge>
        <Grid container spacing={2} direction="column">
          <Grid item>
            <ProfileDetail title={t('components.profile.fields.bio.title')} value={entity.bio} />
          </Grid>
          {entity.tagsets
            ?.filter(t => t.tags.length > 0)
            .map((tagset, i) => (
              <Grid item key={i}>
                <BlockTitle>{tagset.name}</BlockTitle>
                <TagsComponent tags={tagset.tags} count={5} />
              </Grid>
            ))}

          {entity.links && entity.links.length ? (
            <Grid item container direction="column">
              <BlockTitle>{t('components.profile.fields.links.title')}</BlockTitle>
              {entity.links?.map((l, i) => (
                <Link key={i} href={l} target="_blank">
                  {l}
                </Link>
              ))}
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      </CardContent>
    </PageContentBlock>
  );
};

export default OrganizationProfileView;

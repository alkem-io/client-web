import React, { FC } from 'react';
import { Box, Card, CardContent, Grid, Link, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '../../common/components/composite/common/ProfileDetail/ProfileDetail';
import TagsComponent from '../../domain/shared/components/TagsComponent/TagsComponent';
import VerifiedStatus from '../../common/components/composite/common/VerifiedStatus/VerifiedStatus';
import WrapperTypography from '../../common/components/core/WrapperTypography';
import { Location } from '../../models/graphql-schema';

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

export interface OrganizationProfileViewProps {
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
    <Card square variant="outlined">
      <CardContent sx={{ position: 'relative', padding: theme => theme.spacing(4) }}>
        <VerifiedBadge>
          {entity.verified !== undefined && (
            <VerifiedStatus verified={entity.verified} helpText={t('pages.organization.verified-status.help')} />
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
                <WrapperTypography color="primary" weight="boldLight">
                  {tagset.name}
                </WrapperTypography>
                <TagsComponent tags={tagset.tags} count={5} />
              </Grid>
            ))}

          {entity.links && entity.links.length ? (
            <Grid item container direction="column">
              <WrapperTypography color="primary" weight="boldLight">
                {t('components.profile.fields.links.title')}
              </WrapperTypography>
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
    </Card>
  );
};
export default OrganizationProfileView;

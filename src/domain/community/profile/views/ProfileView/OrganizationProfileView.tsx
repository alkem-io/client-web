import { Box, CardContent, Grid, Link, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import OrganizationVerifiedStatus from '@/domain/community/contributor/organization/OrganizationVerifiedStatus';
import { Location } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Gutters from '@/core/ui/grid/Gutters';

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

type OrganizationProfileViewProps = {
  entity: OrganizationProfileViewEntity;
  permissions: {
    canEdit: boolean;
  };
};

const VerifiedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(0),
  top: theme.spacing(0),
}));

export const OrganizationProfileView = ({ entity }: OrganizationProfileViewProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <CardContent sx={{ position: 'relative' }}>
        <VerifiedBadge>
          {entity?.verified !== undefined && (
            <OrganizationVerifiedStatus
              verified={entity.verified}
              helpText={t('pages.organization.verified-status.help')}
            />
          )}
        </VerifiedBadge>
        <Grid container spacing={2} direction="column">
          <Gutters disablePadding>
            <ProfileDetail
              title={t('components.profile.fields.bio.title')}
              // value={entity.bio}
              value="Laboris ad et magna ut officia eiusmod velit irure dolore commodo deserunt tempor dolore cupidatat. Ullamco magna ea est laboris mollit eu non consectetur minim. Mollit commodo do labore incididunt sit tempor aute culpa aute sunt mollit."
            />
          </Gutters>
          {entity.tagsets
            ?.filter(t => t.tags.length > 0)
            .map((tagset, i) => (
              <Gutters key={i}>
                <BlockTitle>{tagset.name}</BlockTitle>
                <TagsComponent tags={tagset.tags} count={5} />
              </Gutters>
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

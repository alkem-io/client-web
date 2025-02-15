import { type Dictionary } from 'lodash';
import { Box, CardContent, Grid, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import OrganizationVerifiedStatus from '@/domain/community/contributor/organization/OrganizationVerifiedStatus';
import { Location } from '@/core/apollo/generated/graphql-schema';
import { BlockSectionTitle, BlockTitle, CardText } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Gutters from '@/core/ui/grid/Gutters';
import References from '@/domain/shared/components/References/References';

export interface OrganizationProfileViewEntity {
  displayName: string;
  settingsUrl: string;
  settingsTooltip: string;
  location?: Location;
  bio?: string;
  tagsets: { name: string; tags: string[] }[];
  links: Dictionary<
    {
      __typename?: 'Reference' | undefined;
      id: string;
      name: string;
      uri: string;
    }[]
  >;
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

const OTHER_LINK_GROUP = 'other';

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
        <Grid container spacing={3.5} direction="column">
          <Gutters>
            <ProfileDetail title={t('components.profile.fields.bio.title')} value={entity.bio} />
          </Gutters>
          {entity.tagsets
            ?.filter(t => t.tags.length > 0)
            .map((tagset, i) => (
              <Gutters key={i}>
                <BlockTitle>{tagset.name}</BlockTitle>
                <TagsComponent tags={tagset.tags} count={5} />
              </Gutters>
            ))}

          <Gutters disableGap>
            <BlockSectionTitle>{t('components.profile.fields.links.title')}</BlockSectionTitle>
            <References
              references={entity.links[OTHER_LINK_GROUP]}
              noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
            />
          </Gutters>
        </Grid>
      </CardContent>
    </PageContentBlock>
  );
};

export default OrganizationProfileView;

import { groupBy, isEmpty } from 'lodash';
import { Box, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import OrganizationVerifiedStatus from '@/domain/community/organization/OrganizationVerifiedStatus';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Gutters from '@/core/ui/grid/Gutters';
import References from '@/domain/shared/components/References/References';
import { useMemo } from 'react';
import {
  isSocialNetworkSupported,
  SocialNetworkEnum,
} from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import SocialLinks from '@/domain/shared/components/SocialLinks/SocialLinks';
import { LocationModelMapped } from '@/domain/common/location/LocationModelMapped';

export interface OrganizationProfileViewEntity {
  displayName: string;
  settingsUrl: string;
  settingsTooltip: string;
  location?: LocationModelMapped;
  bio?: string;
  tagsets: { name: string; tags: string[] }[];
  references: {
    id: string;
    name: string;
    uri: string;
  }[];
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

const TagsWithOffset = styled(TagsComponent)({ marginTop: 5 });

const SOCIAL_LINK_GROUP = 'social';
const OTHER_LINK_GROUP = 'other';

export const OrganizationProfileView = ({ entity }: OrganizationProfileViewProps) => {
  const { t } = useTranslation();

  const links = useMemo(
    () =>
      groupBy(entity.references, reference =>
        isSocialNetworkSupported(reference.name) ? SOCIAL_LINK_GROUP : OTHER_LINK_GROUP
      ),
    [entity.references]
  );

  const socialLinks = links[SOCIAL_LINK_GROUP]?.map(s => ({
    type: s.name as SocialNetworkEnum,
    url: s.uri,
  }));

  return (
    <PageContentBlock>
      <Gutters disablePadding sx={{ position: 'relative' }}>
        <VerifiedBadge>
          {entity?.verified !== undefined && (
            <OrganizationVerifiedStatus
              verified={entity.verified}
              helpText={t('pages.organization.verified-status.help')}
            />
          )}
        </VerifiedBadge>
        <Gutters disablePadding>
          <ProfileDetail title={t('components.profile.fields.bio.title')} value={entity.bio} />
        </Gutters>

        {entity.tagsets
          ?.filter(t => t.tags.length > 0)
          .map((tagset, i) =>
            tagset.tags.length > 0 ? (
              <Gutters key={i} disablePadding disableGap>
                <BlockSectionTitle>{tagset.name}</BlockSectionTitle>
                <TagsWithOffset tags={tagset.tags} count={5} />
              </Gutters>
            ) : null
          )}

        {!isEmpty(links) && (
          <Gutters disablePadding fullHeight maxWidth="100%">
            <BlockSectionTitle>{t('components.profile.fields.links.title')}</BlockSectionTitle>

            <References
              references={links[OTHER_LINK_GROUP]}
              noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
            />

            <SocialLinks items={socialLinks} />
          </Gutters>
        )}
      </Gutters>
    </PageContentBlock>
  );
};

export default OrganizationProfileView;

import { Link, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import { ReactComponent as BuildingIcon } from 'bootstrap-icons/icons/building.svg';
import { ReactComponent as ChatDotsIcon } from 'bootstrap-icons/icons/chat-dots.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as PersonBoundingBoxIcon } from 'bootstrap-icons/icons/person-bounding-box.svg';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import UserCard, { USER_CARD_HEIGHT } from '../../components/composite/common/cards/user-card/UserCard';
import SimpleCard, { RECOMMENDED_HEIGHT } from '../../components/composite/common/simple-card/SimpleCard';
import CardFilter from '../../components/core/card-filter/CardFilter';
import { userTagsValueGetter } from '../../components/core/card-filter/value-getters/user-value-getter';
import { userWithRoleValueGetter } from '../../components/core/card-filter/value-getters/user-with-role-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import Icon from '../../components/core/Icon';
import { Image } from '../../components/core/Image';
import Loading from '../../components/core/Loading/Loading';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { useEcoverse, useUpdateNavigation, useUserCardRoleName } from '../../hooks';
import {
  EcoverseCommunityMessagesDocument,
  useCommunityPageQuery,
  useOrganizationProfileInfoQuery,
} from '../../hooks/generated/graphql';
import {
  CommunityPageMembersFragment,
  EcoverseCommunityMessagesQuery,
  EcoverseCommunityMessagesQueryVariables,
  OrganizationDetailsFragment,
  User,
} from '../../models/graphql-schema';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import { CommunityUpdatesView } from '../../views/CommunityUpdates/CommunityUpdatesView';
import { PageProps } from '../common';
import { CommunityUpdatesDataContainer } from '../../containers/community-updates/CommunityUpdates';

const useStyles = makeStyles(() => ({
  bannerImg: {
    maxWidth: 200,
    height: 'initial',
    margin: '0 auto',
  },
}));

interface Props extends PageProps {
  communityId?: string;
  parentId: string;
  parentDisplayName?: string;
  parentTagline?: string;
  membershipTitle?: string;
  ecoverseHostId?: string;
  leadingOrganizations?: OrganizationDetailsFragment[];
  settingsUrl?: string;
  permissions: {
    edit: boolean;
  };
}

const CommunityPage: FC<Props> = ({
  paths,
  communityId = '',
  membershipTitle,
  parentId,
  parentDisplayName,
  parentTagline,
  ecoverseHostId = '',
  leadingOrganizations,
}) => {
  const styles = useStyles();
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { ecoverseId } = useEcoverse();

  const { data, loading } = useCommunityPageQuery({
    variables: { ecoverseId, communityId },
    skip: !communityId,
    errorPolicy: 'all', // skip error returned from communications if any
  });
  const community = data?.ecoverse.community;
  const groups = community?.groups || [];
  const members = (community?.members || []) as CommunityPageMembersFragment[];
  const membersWithRole = useUserCardRoleName(members as User[], parentId);

  const { data: _orgProfile } = useOrganizationProfileInfoQuery({
    variables: { id: ecoverseHostId },
    skip: !ecoverseHostId,
    errorPolicy: 'all',
  });
  const hostOrganization = _orgProfile?.organization;

  if (loading) {
    return <Loading text={'Loading Community Page'} />;
  }

  return (
    <>
      <Section>
        <SectionHeader text={parentDisplayName} />
        <SubHeader text={parentTagline} />
      </Section>
      <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('common.users')} />
      </Section>
      <CardFilter data={membersWithRole} valueGetter={userWithRoleValueGetter} tagsValueGetter={userTagsValueGetter}>
        {filteredData => (
          <CardContainer cardHeight={USER_CARD_HEIGHT}>
            {filteredData.map(({ displayName, roleName, nameID, profile, city, country }, i) => (
              <UserCard
                key={i}
                roleName={roleName}
                avatarSrc={profile?.avatar || ''}
                displayName={displayName}
                city={city}
                country={country}
                tags={(profile?.tagsets || []).flatMap(x => x.tags)}
                url={buildUserProfileUrl(nameID)}
              />
            ))}
          </CardContainer>
        )}
      </CardFilter>
      {(hostOrganization || leadingOrganizations) && (
        <>
          <Section
            avatar={<Icon component={BuildingIcon} color="primary" size="xl" />}
            details={
              hostOrganization && (
                <Link component={RouterLink} to={buildOrganizationUrl(hostOrganization.nameID)}>
                  <Image
                    src={hostOrganization.profile?.avatar}
                    alt={`${hostOrganization.displayName} logo`}
                    className={styles.bannerImg}
                  />
                </Link>
              )
            }
          >
            <SectionHeader text={membershipTitle} />
            {hostOrganization && (
              <>
                <SubHeader text={hostOrganization.displayName} />
                <Body>{hostOrganization.profile?.description}</Body>
              </>
            )}
          </Section>
        </>
      )}
      {leadingOrganizations && (
        <CardContainer cardHeight={RECOMMENDED_HEIGHT}>
          {leadingOrganizations.map(({ displayName, nameID, profile }, i) => (
            <SimpleCard
              key={i}
              title={displayName}
              avatar={profile?.avatar}
              description={profile?.description}
              tags={profile?.tagsets?.flatMap(y => y.tags)}
              url={buildOrganizationUrl(nameID)}
            />
          ))}
        </CardContainer>
      )}
      <Section avatar={<Icon component={PersonBoundingBoxIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('common.user-groups')} />
      </Section>
      {!groups.length && (
        <Typography align={'center'} variant={'subtitle1'}>
          {t('pages.community.no-user-groups')}
        </Typography>
      )}
      <CardContainer cardHeight={RECOMMENDED_HEIGHT}>
        {groups.map(({ name, profile }, i) => (
          <SimpleCard
            key={i}
            title={name}
            avatar={profile?.avatar}
            description={profile?.description}
            tags={profile?.tagsets?.flatMap(y => y.tags)}
          />
        ))}
      </CardContainer>
      <Section avatar={<Icon component={ChatDotsIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('common.updates')} />
      </Section>
      <CommunityUpdatesDataContainer<EcoverseCommunityMessagesQuery, EcoverseCommunityMessagesQueryVariables>
        entities={{
          document: EcoverseCommunityMessagesDocument,
          variables: {
            ecoverseId,
          },
          messageSelector: data => data?.ecoverse.community?.communication?.updates?.messages || [],
          roomIdSelector: data => data?.ecoverse.community?.communication?.updates?.id || '',
        }}
      >
        {(entities, { retrievingUpdateMessages }) => {
          const hasUpdates = entities.messages && entities.messages.length > 0;

          if (!hasUpdates) {
            return (
              <Typography align={'center'} variant={'subtitle1'}>
                {t('pages.community.no-updates')}
              </Typography>
            );
          }

          return (
            <Box maxHeight={600} style={{ overflowY: 'auto', overflowX: 'clip' }}>
              <AvatarsProvider users={entities.senders}>
                {detailedUsers => (
                  <CommunityUpdatesView
                    entities={{
                      members: detailedUsers,
                      messages: entities.messages,
                    }}
                    options={{
                      hideHeaders: true,
                      itemsPerRow: 1,
                      disableElevation: true,
                      disableCollapse: true,
                    }}
                    state={{
                      loadingMessages: retrievingUpdateMessages,
                      submittingMessage: false,
                      removingMessage: false,
                    }}
                  />
                )}
              </AvatarsProvider>
            </Box>
          );
        }}
      </CommunityUpdatesDataContainer>
    </>
  );
};
export default CommunityPage;

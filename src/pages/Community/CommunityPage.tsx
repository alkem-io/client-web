import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as BuildingIcon } from 'bootstrap-icons/icons/building.svg';
import { ReactComponent as PersonBoundingBoxIcon } from 'bootstrap-icons/icons/person-bounding-box.svg';
import { ReactComponent as ChatDotsIcon } from 'bootstrap-icons/icons/chat-dots.svg';
import React, { FC, useMemo } from 'react';
import { useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../common';
import { useUpdateNavigation, useUserCardRoleName } from '../../hooks';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SettingsButton } from '../../components/composite';
import Divider from '../../components/core/Divider';
import { CommunityPageMembersFragment, OrganizationDetailsFragment, User } from '../../models/graphql-schema';
import Icon from '../../components/core/Icon';
import { useCommunityPageQuery, useOrganizationProfileInfoQuery } from '../../hooks/generated/graphql';
import Loading from '../../components/core/Loading/Loading';
import { CardContainer } from '../../components/core/CardContainer';
import { Typography } from '@material-ui/core';
import { CommunityUpdatesView } from '../../views/CommunityUpdates/CommunityUpdatesView';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import { Image } from '../../components/core/Image';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SimpleCard, { RECOMMENDED_HEIGHT } from '../../components/composite/common/simple-card/SimpleCard';
import CardFilter from '../../components/core/card-filter/CardFilter';
import { userTagsValueGetter } from '../../components/core/card-filter/value-getters/user-value-getter';
import { userWithRoleValueGetter } from '../../components/core/card-filter/value-getters/user-with-role-value-getter';
import UserCard, { USER_CARD_HEIGHT } from '../../components/composite/common/cards/user-card/UserCard';
import { AvatarsProvider } from '../../context/AvatarsProvider';

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
  settingsUrl = '',
  permissions,
}) => {
  const styles = useStyles();
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { data, loading } = useCommunityPageQuery({
    variables: { communityId },
    skip: !communityId,
    errorPolicy: 'all', // skip error returned from communications if any
  });
  const community = data?.community;
  const groups = community?.groups || [];
  const updates = community?.updatesRoom?.messages || [];
  const updateSenders = updates.map(x => ({ id: x.sender }));
  const hasUpdates = updates && updates.length > 0;
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
        <SectionHeader
          text={parentDisplayName}
          editComponent={
            permissions.edit && <SettingsButton color={'primary'} to={settingsUrl} tooltip={t('buttons.settings')} />
          }
        />
        <SubHeader text={parentTagline} />
      </Section>
      <Divider />
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
      <Divider />
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
          <Divider />
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
      <Divider />
      <Section avatar={<Icon component={ChatDotsIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('common.updates')} />
      </Section>
      {!hasUpdates && (
        <Typography align={'center'} variant={'subtitle1'}>
          {t('pages.community.no-updates')}
        </Typography>
      )}
      {hasUpdates && (
        <Box maxHeight={600} style={{ overflowY: 'auto', overflowX: 'clip' }}>
          <AvatarsProvider users={updateSenders}>
            {detailedUsers => (
              <CommunityUpdatesView
                entities={{
                  members: detailedUsers,
                  messages: updates,
                }}
                options={{
                  hideHeaders: true,
                  itemsPerRow: 1,
                  disableElevation: true,
                  disableCollapse: true,
                }}
                state={{
                  loadingMessages: false,
                  submittingMessage: false,
                  removingMessage: false,
                }}
              />
            )}
          </AvatarsProvider>
        </Box>
      )}
      <Divider />
    </>
  );
};
export default CommunityPage;

import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as BuildingIcon } from 'bootstrap-icons/icons/building.svg';
import { ReactComponent as PersonBoundingBoxIcon } from 'bootstrap-icons/icons/person-bounding-box.svg';
import { ReactComponent as ChatDotsIcon } from 'bootstrap-icons/icons/chat-dots.svg';
import React, { FC, useMemo } from 'react';
import { useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
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
import {
  userTagsValueGetter,
  userValueGetter,
} from '../../components/core/card-filter/value-getters/user-value-getter';

const useStyles = makeStyles(() => ({
  bannerImg: {
    maxWidth: 200,
    height: 'initial',
    margin: '0 auto',
  },
}));

interface Props extends PageProps {
  communityId?: string;
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
  });
  const community = data?.community;
  const groups = community?.groups || [];
  const updates = community?.updatesRoom?.messages || [];
  const hasUpdates = updates && updates.length > 0;
  const members = (community?.members || []) as CommunityPageMembersFragment[];

  const { data: _orgProfile } = useOrganizationProfileInfoQuery({
    variables: { id: ecoverseHostId },
    skip: !ecoverseHostId,
  });

  const hostOrganization = _orgProfile?.organization;

  if (loading) {
    return <Loading text={'Loading Community Page'} />;
  }

  return (
    <>
      <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
        <SectionHeader
          text={parentDisplayName}
          editComponent={
            permissions.edit && <SettingsButton color={'primary'} to={settingsUrl} tooltip={t('buttons.settings')} />
          }
        />
        <SubHeader text={parentTagline} />
      </Section>
      <Divider />
      <Section>
        <SectionHeader text={t('common.users')} />
      </Section>
      <CardFilter data={members as User[]} valueGetter={userValueGetter} tagsValueGetter={userTagsValueGetter}>
        {filteredData => (
          <CardContainer cardHeight={RECOMMENDED_HEIGHT}>
            {filteredData.map(({ displayName, nameID, profile }, i) => (
              <SimpleCard
                key={i}
                title={displayName}
                avatar={profile?.avatar}
                description={profile?.description}
                tags={profile?.tagsets?.flatMap(y => y.tags)}
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
        {groups.map(({ id, name, profile }, i) => (
          <SimpleCard
            key={i}
            title={name}
            avatar={profile?.avatar}
            description={profile?.description}
            tags={profile?.tagsets?.flatMap(y => y.tags)}
            url={settingsUrl && `${settingsUrl}/community/groups/${id}`}
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
          <CommunityUpdatesView
            entities={{
              members: members as User[],
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
            }}
          />
        </Box>
      )}
      <Divider />
    </>
  );
};
export default CommunityPage;

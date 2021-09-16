import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as BuildingIcon } from 'bootstrap-icons/icons/building.svg';
import { ReactComponent as PersonBoundingBoxIcon } from 'bootstrap-icons/icons/person-bounding-box.svg';
import { ReactComponent as ChatDotsIcon } from 'bootstrap-icons/icons/chat-dots.svg';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SettingsButton } from '../../components/composite';
import Divider from '../../components/core/Divider';
import { Organisation, User } from '../../models/graphql-schema';
import Icon from '../../components/core/Icon';
import { useCommunityQuery } from '../../hooks/generated/graphql';
import Loading from '../../components/core/Loading/Loading';
import UserGroupCard from '../../components/composite/common/user-group-card/UserGroupCard';
import { CardContainer } from '../../components/core/CardContainer';
import { Typography } from '@material-ui/core';
import { CommunityUpdatesView } from '../../views/CommunityUpdates/CommunityUpdatesView';
import Box from '@material-ui/core/Box';

interface Props extends PageProps {
  communityId?: string;
  parentDisplayName?: string;
  parentTagline?: string;
  membershipTitle?: string;
  ecoverseHost?: Organisation;
  leadingOrganizations?: Organisation[];
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
  settingsUrl = '',
  permissions,
}) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { data, loading } = useCommunityQuery({
    variables: { communityId },
    skip: !communityId,
  });
  const community = data?.community;
  const groups = community?.groups || [];
  const updates = community?.updatesRoom?.messages || [];
  const hasUpdates = updates && updates.length > 0;
  const members = (community?.members || []) as User[];

  if (loading) {
    return <Loading />;
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
      <Section avatar={<Icon component={BuildingIcon} color="primary" size="xl" />}>
        <SectionHeader text={membershipTitle} />
        <Body>{/*todo eco host & challenge leads here*/}</Body>
      </Section>
      <Divider />
      <Section avatar={<Icon component={PersonBoundingBoxIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('common.user-groups')} />
      </Section>
      {!groups.length && (
        <Typography align={'center'} variant={'subtitle1'}>
          {t('pages.community.no-user-groups')}
        </Typography>
      )}
      <CardContainer cardHeight={290}>
        {groups.map(({ id, name, profile }, i) => (
          <UserGroupCard
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
              members: members,
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

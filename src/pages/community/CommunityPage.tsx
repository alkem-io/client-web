import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SettingsButton } from '../../components/composite';
import Divider from '../../components/core/Divider';
import { useTranslation } from 'react-i18next';
import { Organisation } from '../../models/graphql-schema';
import Icon from '../../components/core/Icon';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as BuildingIcon } from 'bootstrap-icons/icons/building.svg';
import { ReactComponent as PersonBoundingBoxIcon } from 'bootstrap-icons/icons/person-bounding-box.svg';
import { ReactComponent as ChatDotsIcon } from 'bootstrap-icons/icons/chat-dots.svg';

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
        <Body>{/*todo user groups*/}</Body>
      </Section>
      <Divider />
      <Section avatar={<Icon component={ChatDotsIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('common.updates')} />
        <Body>{/*todo updates*/}</Body>
      </Section>
      <Divider />
    </>
  );
};
export default CommunityPage;

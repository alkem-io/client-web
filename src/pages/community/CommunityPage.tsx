import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import Section, { Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SettingsButton } from '../../components/composite';
import Divider from '../../components/core/Divider';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
  communityId?: string;
  parentDisplayName?: string;
  parentTagline?: string;
  membershipTitle?: string;
  membershipData?: any; // todo
  settingsUrl?: string;
  permissions: {
    edit: boolean;
  };
}

const CommunityPage: FC<Props> = ({ paths, parentDisplayName, parentTagline, settingsUrl = '', permissions }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

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
    </>
  );
};
export default CommunityPage;

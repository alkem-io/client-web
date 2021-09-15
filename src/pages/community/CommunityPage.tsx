import React, { FC } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import Section, { Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SettingsButton } from '../../components/composite';

interface Props extends PageProps {
  parentDisplayName?: string;
  parentTagline?: string;
  permissions: {
    edit: boolean;
  };
}

const CommunityPage: FC<Props> = ({ paths, parentDisplayName, parentTagline, permissions }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <>
      <Section>
        <SectionHeader
          text={parentDisplayName}
          editComponent={permissions.edit && <SettingsButton color={'primary'} to={''} tooltip={''} />}
        />
        <SubHeader text={parentTagline} />
      </Section>
    </>
  );
};
export default CommunityPage;

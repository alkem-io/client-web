import { Accordion, AccordionProps } from '../../../components/composite/common/Accordion/Accordion';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { styled } from '@mui/styles';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import ContributingOrganizations, { ContributingOrganizationsProps } from './ContributingOrganizations';
import ContributingUsers, { ContributingUsersProps } from './ContributingUsers';

interface CommunityContributorsAccordionProps
  extends ContributingOrganizationsProps,
    ContributingUsersProps,
    AccordionProps {
  title: string;
  helpText?: string;
  ariaKey: string;
  loading?: boolean;
  organizationsCount: number | undefined;
  usersCount: number | undefined;
}

const SubSectionHeading = styled(props => <Typography variant="h3" {...props} />)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const CommunityContributorsAccordion = ({
  organizations = [],
  users = [],
  organizationsCount,
  usersCount,
  noOrganizationsView,
  loading,
  ...accordionProps
}: CommunityContributorsAccordionProps) => {
  const { t } = useTranslation();

  return (
    <Accordion {...accordionProps} loading={loading}>
      <SubSectionHeading>{withOptionalCount(t('common.organizations'), organizationsCount)}</SubSectionHeading>
      <ContributingOrganizations
        organizations={organizations}
        loading={loading}
        noOrganizationsView={noOrganizationsView}
      />
      <SectionSpacer />
      <SubSectionHeading>{withOptionalCount(t('common.users'), usersCount)}</SubSectionHeading>
      <ContributingUsers users={users} loading={loading} />
    </Accordion>
  );
};

export default CommunityContributorsAccordion;

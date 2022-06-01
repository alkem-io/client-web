import { Accordion } from '../../../components/composite/common/Accordion/Accordion';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../components/core/Section/Section';
import { styled } from '@mui/styles';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import ContributingOrganizations, { ContributingOrganizationsProps } from './ContributingOrganizations';
import ContributingUsers, { ContributingUsersProps } from './ContributingUsers';

interface CommunityContributorsAccordionProps extends ContributingOrganizationsProps, ContributingUsersProps {
  title: string;
  helpText?: string;
  ariaKey: string;
  loading?: boolean;
  organizationsCount: number | undefined;
  usersCount: number | undefined;
  hideOrganizations?: boolean;
  hideUsers?: boolean;
}

const SubSectionHeading = styled(props => <Typography variant="h3" {...props} />)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
}));

const CommunityContributorsAccordion = ({
  title,
  helpText,
  organizations = [],
  users = [],
  organizationsCount,
  usersCount,
  ariaKey,
  loading = false,
  hideOrganizations = false,
  hideUsers = false,
}: CommunityContributorsAccordionProps) => {
  const { t } = useTranslation();

  return (
    <Accordion title={title} helpText={helpText} ariaKey={ariaKey} loading={loading}>
      {!hideOrganizations && (
        <>
          <SubSectionHeading>{withOptionalCount(t('common.organizations'), organizationsCount)}</SubSectionHeading>
          <ContributingOrganizations organizations={organizations} loading={loading} />
          <SectionSpacer />
        </>
      )}
      {!hideUsers && (
        <>
          <SubSectionHeading>{withOptionalCount(t('common.users'), usersCount)}</SubSectionHeading>
          <ContributingUsers users={users} loading={loading} />
        </>
      )}
    </Accordion>
  );
};

export default CommunityContributorsAccordion;

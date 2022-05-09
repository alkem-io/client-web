import { Accordion, AccordionProps } from '../../../common/components/composite/common/Accordion/Accordion';
import React from 'react';
import CommunityContributorsView, { CommunityContributorsViewProps } from './CommunityContributorsView';

interface CommunityContributorsAccordionProps extends CommunityContributorsViewProps, AccordionProps {
  title: string;
  helpText?: string;
  ariaKey: string;
}

const CommunityContributorsAccordion = ({
  organizations = [],
  users = [],
  organizationsCount,
  usersCount,
  noOrganizationsView,
  loading,
  ...accordionProps
}: CommunityContributorsAccordionProps) => {
  return (
    <Accordion {...accordionProps} loading={loading}>
      <CommunityContributorsView
        {...{
          organizations,
          users,
          organizationsCount,
          usersCount,
          noOrganizationsView,
          loading,
        }}
      />
    </Accordion>
  );
};

export default CommunityContributorsAccordion;

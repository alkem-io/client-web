import React, { PropsWithChildren } from 'react';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

interface EditCommunityMembersSectionProps {
  memberType: 'members' | 'leads';
}

const EditCommunityMembersSection = ({ memberType, children }: PropsWithChildren<EditCommunityMembersSectionProps>) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t(`community.${memberType}` as const)}>
      <Box display="flex" gap={4}>
        {React.Children.map(children, (child, i) => (
          <Box flexBasis={0} flexGrow={1} key={i}>
            {child}
          </Box>
        ))}
      </Box>
    </DashboardGenericSection>
  );
};

export default EditCommunityMembersSection;

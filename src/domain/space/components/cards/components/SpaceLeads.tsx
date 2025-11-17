import { Box, Avatar } from '@mui/material';
import ContributorTooltip from '@/core/ui/card/ContributorTooltip';
import RouterLink from '@/core/ui/link/RouterLink';

export interface Lead {
  id: string;
  profile: {
    id: string;
    url: string;
    displayName: string;
    avatar?: {
      uri: string;
      alternativeText?: string;
    };
  };
}

export interface LeadOrganization {
  id: string;
  profile: {
    id: string;
    url: string;
    displayName: string;
    avatar?: {
      uri: string;
      alternativeText?: string;
    };
  };
}

interface SpaceLeadsProps {
  leadUsers?: Lead[];
  leadOrganizations?: LeadOrganization[];
  showLeads: boolean;
}

const SpaceLeads = ({ leadUsers = [], leadOrganizations = [], showLeads }: SpaceLeadsProps) => {
  if (!showLeads || (leadUsers.length === 0 && leadOrganizations.length === 0)) {
    return showLeads ? (
      <Box width="36px" height="36px">
        &nbsp;
      </Box>
    ) : null;
  }

  const allLeads = [...leadUsers, ...leadOrganizations];

  return (
    <Box display="flex" flexWrap="wrap" gap={1} paddingX={1.5}>
      {allLeads.map(lead => {
        return (
          <ContributorTooltip
            key={lead.id}
            displayName={lead.profile.displayName}
            avatarSrc={lead.profile.avatar?.uri}
            tags={[]} // Tags not available in this context
            city={undefined}
            country={undefined}
            isContactable={false}
          >
            <Avatar
              component={RouterLink}
              to={lead.profile.url}
              src={lead.profile.avatar?.uri}
              alt={lead.profile.avatar?.alternativeText || lead.profile.displayName}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'boxShadow 0.2s',
                boxShadow: 1,
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            />
          </ContributorTooltip>
        );
      })}
    </Box>
  );
};

export default SpaceLeads;

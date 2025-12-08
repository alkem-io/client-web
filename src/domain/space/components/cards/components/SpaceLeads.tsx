import { Box, Avatar, Typography } from '@mui/material';
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
    location?: {
      city?: string;
      country?: string;
    };
    tagsets?: {
      tags: string[];
    }[];
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
    location?: {
      city?: string;
      country?: string;
    };
    tagsets?: {
      tags: string[];
    }[];
  };
}

export type LeadType = 'user' | 'organization';

interface SpaceLeadsProps {
  leadUsers?: Lead[];
  leadOrganizations?: LeadOrganization[];
  showLeads: boolean;
  onContactLead?: (leadType: LeadType, leadId: string, leadDisplayName: string, leadAvatarUri?: string) => void;
}

const MAX_VISIBLE_LEADS = 3;

const SpaceLeads = ({ leadUsers = [], leadOrganizations = [], showLeads, onContactLead }: SpaceLeadsProps) => {
  if (!showLeads || (leadUsers.length === 0 && leadOrganizations.length === 0)) {
    return showLeads ? (
      <Box width="36px" height="36px">
        &nbsp;
      </Box>
    ) : null;
  }

  const allLeads = [...leadUsers, ...leadOrganizations];
  const totalCount = allLeads.length;

  // Show only first 2 leads if we have more than 3, to leave room for the "+N" indicator
  const visibleLeads = totalCount > MAX_VISIBLE_LEADS ? allLeads.slice(0, MAX_VISIBLE_LEADS - 1) : allLeads;
  const overflowCount = totalCount > MAX_VISIBLE_LEADS ? totalCount - (MAX_VISIBLE_LEADS - 1) : 0;

  // Helper to check if a lead is a user (has isContactable property)
  const isUserLead = (lead: Lead | LeadOrganization): lead is Lead => 'isContactable' in lead;

  return (
    <Box display="flex" flexWrap="wrap" gap={1} paddingLeft={1.5}>
      {visibleLeads.map(lead => {
        const tags = lead.profile.tagsets?.flatMap(tagset => tagset.tags) ?? [];
        const isUser = isUserLead(lead);
        const isContactable = Boolean(onContactLead);
        const leadType: LeadType = isUser ? 'user' : 'organization';

        return (
          <ContributorTooltip
            key={lead.id}
            displayName={lead.profile.displayName}
            avatarSrc={lead.profile.avatar?.uri}
            tags={tags}
            city={lead.profile.location?.city}
            country={lead.profile.location?.country}
            isContactable={isContactable}
            onContact={
              isContactable
                ? () => onContactLead?.(leadType, lead.id, lead.profile.displayName, lead.profile.avatar?.uri)
                : undefined
            }
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
      {overflowCount > 0 && (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            bgcolor: 'grey.300',
            color: 'grey.700',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <Typography variant="caption" fontWeight={500}>
            +{overflowCount}
          </Typography>
        </Avatar>
      )}
    </Box>
  );
};

export default SpaceLeads;

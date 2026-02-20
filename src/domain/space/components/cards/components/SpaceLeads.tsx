import { Box, Avatar, Typography } from '@mui/material';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';
import RouterLink from '@/core/ui/link/RouterLink';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

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

  // Create typed lead entries that preserve whether they're users or organizations
  type TypedLead = { type: 'user'; data: Lead } | { type: 'organization'; data: LeadOrganization };

  const typedLeadUsers: TypedLead[] = leadUsers.map(user => ({ type: 'user' as const, data: user }));
  const typedLeadOrganizations: TypedLead[] = leadOrganizations.map(org => ({
    type: 'organization' as const,
    data: org,
  }));
  const allLeads = [...typedLeadUsers, ...typedLeadOrganizations];
  const totalCount = allLeads.length;

  // Show only first 2 leads if we have more than 3, to leave room for the "+N" indicator
  const visibleLeads = totalCount > MAX_VISIBLE_LEADS ? allLeads.slice(0, MAX_VISIBLE_LEADS - 1) : allLeads;
  const overflowCount = totalCount > MAX_VISIBLE_LEADS ? totalCount - (MAX_VISIBLE_LEADS - 1) : 0;
  const visibleItemCount = visibleLeads.length + (overflowCount > 0 ? 1 : 0);

  return (
    <Box display="flex" flexWrap="nowrap" gap={visibleItemCount >= 3 ? 0.5 : 1} paddingLeft={1.5}>
      {visibleLeads.map(typedLead => {
        const lead = typedLead.data;
        const isUser = typedLead.type === 'user';
        const leadType: LeadType = isUser ? 'user' : 'organization';
        const contributorType = isUser ? RoleSetContributorType.User : RoleSetContributorType.Organization;
        const hasContactCallback = Boolean(onContactLead);

        return (
          <ContributorTooltip
            key={lead.id}
            contributorId={lead.id}
            contributorType={contributorType}
            onContact={
              hasContactCallback
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

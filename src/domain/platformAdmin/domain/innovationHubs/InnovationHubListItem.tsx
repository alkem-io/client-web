import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import ListItemLink, { ListItemLinkProps } from '@/domain/shared/components/SearchableList/ListItemLink';
import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface InnovationHubListItemProps extends ListItemLinkProps {
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
  accountOwner?: string;
}

const InnovationHubListItem = ({
  listedInStore,
  searchVisibility,
  accountOwner,
  ...props
}: InnovationHubListItemProps) => {
  return (
    <ListItemLink
      {...props}
      primary={
        <Box display="flex" alignItems="center" gap={2} width="100%">
          {/* Name Column */}
          <Box flex={2} minWidth={0}>
            <Typography variant="body1" fontWeight={500} noWrap>
              {props.primary}
            </Typography>
          </Box>

          {/* Listed in Store Column */}
          <Box display="flex" alignItems="center" gap={0.5} flex={1} minWidth="120px">
            {listedInStore ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <CancelIcon color="disabled" fontSize="small" />
            )}
            <Typography variant="body2" color="text.secondary">
              {listedInStore ? 'Listed' : 'Not Listed'}
            </Typography>
          </Box>

          {/* Search Visibility Column */}
          <Box flex={1} minWidth="100px">
            <Chip
              label={searchVisibility}
              size="small"
              color={searchVisibility === SearchVisibility.Public ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {/* Account Owner Column */}
          <Box flex={1} minWidth="150px">
            <Typography variant="body2" color="text.secondary" noWrap title={accountOwner}>
              {accountOwner || 'N/A'}
            </Typography>
          </Box>
        </Box>
      }
    />
  );
};

export default InnovationHubListItem;

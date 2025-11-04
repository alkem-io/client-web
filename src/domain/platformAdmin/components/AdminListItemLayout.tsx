import React, { ReactNode } from 'react';
import { Box, Chip } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export interface AdminListItemColumn {
  flex?: number;
  minWidth?: string;
  content: ReactNode;
}

interface AdminListItemLayoutProps {
  name: ReactNode;
  columns: AdminListItemColumn[];
}

/**
 * Reusable layout component for admin list items with consistent column structure
 * Follows Single Responsibility Principle by handling only the layout rendering
 */
export const AdminListItemLayout = ({ name, columns }: AdminListItemLayoutProps) => {
  return (
    <Box display="flex" alignItems="center" gap={2} width="100%">
      {/* Name Column - always first */}
      <Box flex={2} minWidth={0}>
        <Caption fontWeight={500} noWrap>
          {name}
        </Caption>
      </Box>

      {/* Dynamic columns */}
      {columns.map((column, index) => (
        <Box key={index} flex={column.flex || 1} minWidth={column.minWidth || '100px'}>
          {column.content}
        </Box>
      ))}
    </Box>
  );
};

interface ListedInStoreColumnProps {
  listedInStore: boolean;
}

/**
 * Renders the "Listed in Store" column with visual indicator
 * Follows Single Responsibility Principle - handles only this column's rendering
 */
export const ListedInStoreColumn = ({ listedInStore }: ListedInStoreColumnProps) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    {listedInStore ? (
      <CheckCircleIcon color="success" fontSize="small" />
    ) : (
      <CancelIcon color="disabled" fontSize="small" />
    )}
    <Caption color="text.secondary">{listedInStore ? 'Listed' : 'Not Listed'}</Caption>
  </Box>
);

interface SearchVisibilityColumnProps {
  searchVisibility: SearchVisibility;
}

/**
 * Renders the Search Visibility column with colored chip
 * Follows Single Responsibility Principle - handles only this column's rendering
 */
export const SearchVisibilityColumn = ({ searchVisibility }: SearchVisibilityColumnProps) => (
  <Chip
    label={searchVisibility}
    size="small"
    color={searchVisibility === SearchVisibility.Public ? 'success' : 'default'}
    variant="outlined"
  />
);

interface AccountOwnerColumnProps {
  accountOwner?: string;
}

/**
 * Renders the Account Owner column
 * Follows Single Responsibility Principle - handles only this column's rendering
 */
export const AccountOwnerColumn = ({ accountOwner }: AccountOwnerColumnProps) => (
  <Caption color="text.secondary" noWrap title={accountOwner}>
    {accountOwner || 'N/A'}
  </Caption>
);

interface VisibilityChipColumnProps<T extends string> {
  value: T;
  activeValue: T;
  label: string;
}

/**
 * Generic reusable component for rendering visibility/status chips
 * Follows Open/Closed Principle - can be extended for different visibility types
 */
export const VisibilityChipColumn = <T extends string>({ value, activeValue, label }: VisibilityChipColumnProps<T>) => (
  <Chip label={label || value} size="small" color={value === activeValue ? 'success' : 'default'} variant="outlined" />
);

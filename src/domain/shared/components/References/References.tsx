import React, { ReactNode } from 'react';
import ReferenceView from './ReferenceView';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { OpenInNew } from '@mui/icons-material';
import RouterLink from '@/core/ui/link/RouterLink';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { Text } from '@/core/ui/typography';
import { ReferenceModelWithOptionalAuthorization } from '@/domain/common/reference/ReferenceModel';

interface ReferencesProps<T extends ReferenceModelWithOptionalAuthorization> {
  references: T[] | undefined;
  noItemsView?: ReactNode;
  compact?: boolean;
  onEdit?: (reference: T) => void;
  containerProps?: BoxProps;
}

const References = <T extends ReferenceModelWithOptionalAuthorization>({
  references,
  onEdit,
  noItemsView,
  compact,
  containerProps,
}: ReferencesProps<T>) => {
  if (!references || references.length === 0) {
    return null;
  }

  if (compact) {
    if (references && references.length > 0) {
      return (
        <Box>
          {references.map(reference => (
            <RouterLink
              key={reference.id}
              to={reference.uri}
              title={reference.description}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <OpenInNew fontSize="inherit" />
              <Text>{reference.name}</Text>
            </RouterLink>
          ))}
        </Box>
      );
    }
    return null;
  } else {
    return (
      <Box display="flex" flexDirection="column" gap={gutters()} {...containerProps}>
        {!references
          ? null
          : references.map(reference => (
              <ReferenceView
                key={reference.id}
                reference={reference}
                canEdit={reference.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)}
                onClickEdit={onEdit ? () => onEdit?.(reference) : undefined}
              />
            ))}
        {references && !references.length && noItemsView}
      </Box>
    );
  }
};

export default References;

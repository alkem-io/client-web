import React, { FC, ReactNode } from 'react';
import { Reference, ReferenceWithAuthorization } from '../../../common/profile/Profile';
import ReferenceView, { ReferenceViewProps } from './ReferenceView';
import { Box } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { OpenInNew } from '@mui/icons-material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { Text } from '../../../../core/ui/typography';

interface ReferencesProps {
  references: ReferenceWithAuthorization[] | undefined;
  noItemsView?: ReactNode;
  icon?: ReferenceViewProps['icon'];
  compact?: boolean;
  onEdit?: (reference: Reference) => void;
}

const References: FC<ReferencesProps> = ({ references, onEdit, noItemsView, icon, compact }) => {
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
      <Box display="flex" flexDirection="column" gap={gutters()}>
        {!references
          ? null
          : references.map(reference => (
              <ReferenceView
                key={reference.id}
                reference={reference}
                icon={icon}
                canEdit={reference.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)}
                onClickEdit={() => onEdit?.(reference)}
              />
            ))}
        {references && !references.length && noItemsView}
      </Box>
    );
  }
};

export default References;

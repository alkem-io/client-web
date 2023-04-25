import React, { FC, ReactNode } from 'react';
import { Reference } from '../../../common/profile/Profile';
import ReferenceView, { ReferenceViewProps } from './ReferenceView';
import { Box, styled } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { OpenInNew } from '@mui/icons-material';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface ReferencesProps {
  references: Reference[] | undefined;
  noItemsView?: ReactNode;
  icon?: ReferenceViewProps['icon'];
  compact?: boolean;
}

const CompactView = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  fontSize: 14,
  '& svg': {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
  },
}));

const References: FC<ReferencesProps> = ({ references, noItemsView, icon, compact }) => {
  if (compact) {
    if (references && references.length > 0) {
      return (
        <CompactView>
          {references.map(reference => (
            <RouterLink key={reference.id} to={reference.uri} title={reference.description}>
              <OpenInNew fontSize="small" />
              {reference.name}
            </RouterLink>
          ))}
        </CompactView>
      );
    }
    return null;
  } else {
    return (
      <Box display="flex" flexDirection="column" gap={gutters()}>
        {!references
          ? null
          : references.map(reference => <ReferenceView key={reference.id} reference={reference} icon={icon} />)}
        {references && !references.length && noItemsView}
      </Box>
    );
  }
};

export default References;

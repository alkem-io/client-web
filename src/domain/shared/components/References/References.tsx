import React, { FC, ReactNode } from 'react';
import { Reference } from '../../../common/profile/Profile';
import ReferenceView, { ReferenceViewProps } from './Reference';
import { Box } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';

interface ReferencesProps {
  references: Reference[] | undefined;
  noItemsView?: ReactNode;
  icon?: ReferenceViewProps['icon'];
}

const References: FC<ReferencesProps> = ({ references, noItemsView, icon }) => {
  return (
    <Box display="flex" flexDirection="column" gap={gutters()}>
      {!references
        ? null
        : references.map(reference => <ReferenceView key={reference.id} reference={reference} icon={icon} />)}
      {references && !references.length && noItemsView}
    </Box>
  );
};

export default References;

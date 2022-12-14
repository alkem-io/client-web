import React, { FC, ReactNode } from 'react';
import { Reference } from '../../../../../domain/common/profile/Profile';
import ReferenceView from './Reference';
import { Box } from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';

interface ReferencesProps {
  references: Reference[] | undefined;
  noItemsView?: ReactNode;
}

const References: FC<ReferencesProps> = ({ references, noItemsView }) => {
  return (
    <Box display="flex" flexDirection="column" gap={gutters()}>
      {!references ? null : references.map((reference, i) => <ReferenceView key={i} reference={reference} />)}
      {references && !references.length && noItemsView}
    </Box>
  );
};

export default References;

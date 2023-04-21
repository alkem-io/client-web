import React, { FC, ReactNode } from 'react';
import { Reference } from '../../../common/profile/Profile';
import ReferenceView, { ReferenceViewProps } from './ReferenceView';
import { Box, Link, styled } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { OpenInNew } from '@mui/icons-material';

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
            <Link key={reference.id} href={reference.uri} title={reference.description}>
              <OpenInNew fontSize="small" />
              {reference.name}
            </Link>
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

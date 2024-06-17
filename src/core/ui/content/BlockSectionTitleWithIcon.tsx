import React, { cloneElement, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { BlockSectionTitle, Caption } from '../typography';
import { SvgIconProps, Tooltip } from '@mui/material';
import Gutters from '../grid/Gutters';

interface BlockSectionTitleWithIconProps {
  tooltip?: ReactNode;
  icon?: ReactElement<SvgIconProps>;
}

const BlockSectionTitleWithIcon = ({ icon, tooltip, children }: PropsWithChildren<BlockSectionTitleWithIconProps>) => {
  return (
    <Gutters row disablePadding gap={0.5}>
      <BlockSectionTitle>{children}</BlockSectionTitle>
      {icon && (
        <Tooltip title={tooltip && <Caption>{tooltip}</Caption>}>{cloneElement(icon, { fontSize: 'small' })}</Tooltip>
      )}
    </Gutters>
  );
};

export default BlockSectionTitleWithIcon;

import { type SvgIconProps, Tooltip } from '@mui/material';
import { cloneElement, type PropsWithChildren, type ReactElement, type ReactNode } from 'react';
import Gutters from '../grid/Gutters';
import { BlockSectionTitle, Caption } from '../typography';

type BlockSectionTitleWithIconProps = {
  tooltip?: ReactNode;
  icon?: ReactElement<SvgIconProps>;
};

const BlockSectionTitleWithIcon = ({ icon, tooltip, children }: PropsWithChildren<BlockSectionTitleWithIconProps>) => (
  <Gutters row={true} disablePadding={true} gap={0.5}>
    <BlockSectionTitle>{children}</BlockSectionTitle>
    {icon && (
      <Tooltip title={tooltip && <Caption>{tooltip}</Caption>}>{cloneElement(icon, { fontSize: 'small' })}</Tooltip>
    )}
  </Gutters>
);

export default BlockSectionTitleWithIcon;

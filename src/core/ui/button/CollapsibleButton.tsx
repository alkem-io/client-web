import { Button, ButtonProps, Collapse } from '@mui/material';
import React, { useState, PropsWithChildren } from 'react';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { Caption } from '../typography';

interface CollapsibleButtonProps {
  expandable?: boolean;
}

const CollapsibleButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  expandable = false,
  sx,
  children,
  ...props
}: PropsWithChildren<CollapsibleButtonProps & ButtonProps<D, P>>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Button
      sx={{
        minWidth: 0,
        paddingX: 1,
        '&.MuiButton-outlinedSizeMedium': { paddingX: 0.9, minWidth: 0 },
        '.MuiButton-startIcon': isExpanded ? {} : { margin: 0 },
        ...sx,
      }}
      onMouseEnter={() => setIsExpanded(expandable)}
      onMouseLeave={() => setIsExpanded(false)}
      {...props}
    >
      <Collapse in={isExpanded} orientation="horizontal">
        <Caption noWrap>{children}</Caption>
      </Collapse>
    </Button>
  );
};

export default CollapsibleButton;

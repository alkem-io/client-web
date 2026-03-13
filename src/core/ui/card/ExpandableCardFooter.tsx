import { Box, type BoxProps, Collapse } from '@mui/material';
import { cloneElement, type PropsWithChildren, type ReactElement, type ReactNode } from 'react';
import CardContent from './CardContent';
import CardExpandButton from './CardExpandButton';
import type { CardTagsProps } from './CardTags';

interface CardExpandableProps extends BoxProps {
  expanded: boolean;
  expandable?: boolean;
  expansion?: ReactNode;
  actions?: ReactNode;
  expansionActions?: ReactNode;
  tags?: ReactElement<CardTagsProps>;
}

const ExpandableCardFooter = ({
  actions,
  expansionActions,
  expansion,
  tags,
  expanded = false,
  expandable = true,
  ...containerProps
}: PropsWithChildren<CardExpandableProps>) => {
  return (
    <>
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="space-between"
        paddingX={1.5}
        flexWrap={actions ? 'wrap' : 'nowrap'}
        {...containerProps}
      >
        {tags &&
          cloneElement(tags, { visibility: expanded ? 'hidden' : 'visible', flexBasis: actions ? '100%' : undefined })}
        {actions}
        {expandable && <CardExpandButton expanded={expanded} />}
      </Box>
      <Collapse in={expandable && expanded}>
        <CardContent {...containerProps}>
          {expansion}
          {tags && cloneElement(tags, { rows: 2 })}
          {expansionActions}
        </CardContent>
      </Collapse>
    </>
  );
};

export default ExpandableCardFooter;

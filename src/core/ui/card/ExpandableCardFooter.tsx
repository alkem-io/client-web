import { Box, Collapse } from '@mui/material';
import CardExpandButton from './CardExpandButton';
import CardContent from './CardContent';
import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { CardTagsProps } from './CardTags';

interface CardExpandableProps {
  expanded: boolean;
  expandable?: boolean;
  expansion?: ReactNode;
  actions?: ReactNode;
  expansionActions?: ReactNode;
  tagsComponent: ComponentType<CardTagsProps>;
  tags: string[];
}

const ExpandableCardFooter = ({
  actions,
  expansionActions,
  expansion,
  tags,
  tagsComponent: Tags,
  expanded = false,
  expandable = true,
}: PropsWithChildren<CardExpandableProps>) => {
  return (
    <>
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="space-between"
        paddingX={1.5}
        flexWrap={actions ? 'wrap' : 'nowrap'}
      >
        <Tags tags={tags} visibility={expanded ? 'hidden' : 'visible'} flexBasis={actions ? '100%' : undefined} />
        {actions}
        {expandable && <CardExpandButton expanded={expanded} />}
      </Box>
      <Collapse in={expandable && expanded}>
        <CardContent>
          {expansion}
          <Tags tags={tags} rows={2} />
          {expansionActions}
        </CardContent>
      </Collapse>
    </>
  );
};

export default ExpandableCardFooter;

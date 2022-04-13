import React, { cloneElement, FC, ReactElement } from 'react';
import { SectionSpacer } from '../../../core/Section/Section';
import { Grid, GridProps } from '@mui/material';

// TODO use ReactNode
type Child = ReactElement | false;
type ChildrenType = Child | Child[];

const insertSpacers = (children: ChildrenType) => {
  const [firstChild, ...childrenTail] = React.Children.toArray(children) as ReactElement[];

  return childrenTail.reduce(
    (spacedChildren, child, i) => {
      return [...spacedChildren, <SectionSpacer key={`spacer_${i}`} />, cloneElement(child, { key: `item_${i + 1}` })];
    },
    [cloneElement(firstChild, { key: 'item_0' })]
  );
};

interface ContextSectionColumnProps extends Omit<GridProps, 'children'> {
  children: ChildrenType;
}

const DashboardColumn: FC<ContextSectionColumnProps> = ({ children }) => {
  return (
    <Grid item xs={12} lg={6} zeroMinWidth>
      {insertSpacers(children)}
    </Grid>
  );
};

export default DashboardColumn;

import React, { cloneElement, FC, ReactElement } from 'react';
import { SectionSpacer } from '../../../../domain/shared/components/Section/Section';
import { Grid, GridProps } from '@mui/material';
import { mapWithSeparator } from '../../../../domain/shared/utils/joinNodes';

type Child = ReactElement | false;
type ChildrenType = Child | Child[];

const insertSpacers = (children: ChildrenType) => {
  if (!Array.isArray(children)) {
    return children;
  }

  return mapWithSeparator(children, SectionSpacer, (element, i) => {
    return element && cloneElement(element, { key: `dashboard_section_${i}` });
  });
};

export interface ContextSectionColumnProps extends Omit<GridProps, 'children'> {
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

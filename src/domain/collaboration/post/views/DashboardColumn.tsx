import React, { cloneElement, FC, ReactElement } from 'react';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { Grid, GridProps } from '@mui/material';
import { mapWithSeparator } from '../../../shared/utils/joinNodes';

type Child = ReactElement | false;
type ChildrenType = Child | Child[];

const isReactElement = (element: unknown): element is ReactElement => !!(element as ReactElement).type;

const insertSpacers = (children: ChildrenType) => {
  if (!Array.isArray(children)) {
    return children;
  }

  const reactElements = children.filter(isReactElement);

  return mapWithSeparator(reactElements, SectionSpacer, (element, i) => {
    return element && cloneElement(element, { key: `dashboard_section_${i}` });
  });
};

export interface ContextSectionColumnProps extends Omit<GridProps, 'children'> {
  children: ChildrenType;
}

/**
 * @deprecated - use components from core/ui/content
 */
const DashboardColumn: FC<ContextSectionColumnProps> = ({ children }) => {
  return (
    <Grid item xs={12} lg={6} zeroMinWidth>
      {insertSpacers(children)}
    </Grid>
  );
};

export default DashboardColumn;

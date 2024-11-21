import { cloneElement, PropsWithChildren, ReactElement } from 'react';
import { SectionSpacer } from '@/domain/shared/components/Section/Section';
import { Grid, GridProps } from '@mui/material';
import { mapWithSeparator } from '@/domain/shared/utils/joinNodes';

type Child = ReactElement | false;
type ChildrenType = Child | Child[];

const isReactElement = (element: unknown): element is ReactElement => !!(element as ReactElement).type;

const insertSpacers = (children: ChildrenType) => {
  if (!Array.isArray(children)) {
    return children;
  }

  const reactElements = children.filter(isReactElement);

  return mapWithSeparator(
    reactElements,
    SectionSpacer,
    (element, i) => element && cloneElement(element, { key: `dashboard_section_${i}` })
  );
};

export interface ContextSectionColumnProps extends Omit<GridProps, 'children'> {
  children: ChildrenType;
}

/**
 * @deprecated - use components from core/ui/content
 */
const DashboardColumn = ({ children }: PropsWithChildren<ContextSectionColumnProps>) => (
  <Grid item xs={12} lg={6} zeroMinWidth>
    {insertSpacers(children)}
  </Grid>
);

export default DashboardColumn;

import React, { Children, cloneElement, PropsWithChildren, ReactElement, ReactNode, useState } from 'react';
import { Box } from '@mui/material';
import { DoubleArrow } from '@mui/icons-material';
import { gutters } from '../grid/utils';
import { Expandable } from './Expandable';

interface BreadcrumbsProps<ItemProps extends Expandable> {
  children: ReactElement<ItemProps> | (ReactElement<ItemProps> | ReactElement<ItemProps>[])[];
}

const BreadcrumbsSeparator = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={gutters(0.5)}
      width={gutters(0.5)}
      fontSize={8}
      borderRadius={0.5}
      sx={{ backgroundColor: theme => theme.palette.divider }}
    >
      <DoubleArrow fontSize="inherit" color="primary" />
    </Box>
  );
};

type JourneyBreadcrumbsExpandedState = Record<string | number, boolean>;

const Breadcrumbs = <ItemProps extends Expandable>({ children }: PropsWithChildren<BreadcrumbsProps<ItemProps>>) => {
  const [expandedState, setExpandedState] = useState<JourneyBreadcrumbsExpandedState>({});

  const [firstChild, ...restChildren] = (Children.toArray(children) as ReactElement<ItemProps>[]).map(child => {
    const expanded = (child.key && expandedState[child.key]) || false;

    const onExpand = child.key ? () => onHoverItem(child.key!) : undefined;

    return cloneElement(child, { expanded, onExpand } as Partial<ItemProps>);
  });

  const childrenWithSeparator =
    firstChild &&
    restChildren.reduce<ReactNode[]>(
      (acc, child, index) => {
        acc.push(<BreadcrumbsSeparator key={`_separator_${index}`} />, child);

        return acc;
      },
      [firstChild]
    );

  const onLeave = () => {
    setExpandedState({});
  };

  const onHoverItem = (childKey: string | number) => {
    setExpandedState(prevExpandedState => ({
      ...prevExpandedState,
      [childKey]: true,
    }));
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      gap={gutters(0.5)}
      alignItems="center"
      padding={gutters(0.5)}
      onMouseLeave={onLeave}
    >
      {childrenWithSeparator}
    </Box>
  );
};

export default Breadcrumbs;

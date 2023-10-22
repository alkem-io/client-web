import React, {
  Children,
  cloneElement,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Box, ClickAwayListener, Theme, useMediaQuery } from '@mui/material';
import { DoubleArrow } from '@mui/icons-material';
import { gutters } from '../grid/utils';
import { Expandable } from './Expandable';
import { some } from 'lodash';

interface BreadcrumbsProps<ItemProps extends Expandable> {
  onExpand?: (isExpanded: boolean) => void;
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

const Breadcrumbs = <ItemProps extends Expandable>({
  onExpand,
  children,
}: PropsWithChildren<BreadcrumbsProps<ItemProps>>) => {
  const [expandedState, setExpandedState] = useState<JourneyBreadcrumbsExpandedState>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const [firstChild, ...restChildren] = (Children.toArray(children) as ReactElement<ItemProps>[]).map(child => {
    const expanded = isExpanded || (child.key && expandedState[child.key]) || false;

    const onExpand = child.key ? () => handleItemHover(child.key!) : undefined;

    return cloneElement(child, { expanded, onExpand } as Partial<ItemProps>);
  });

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  useEffect(() => {
    setExpandedState({});
    setIsExpanded(false);
  }, [isSmallScreen]);

  useEffect(() => {
    onExpand?.(isExpanded || some(expandedState));
  }, [isExpanded, expandedState]);

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

  const handleItemHover = (childKey: string | number) => {
    setExpandedState(prevExpandedState => ({
      ...prevExpandedState,
      [childKey]: true,
    }));
  };

  const handleClick: MouseEventHandler = event => {
    if (!isSmallScreen) {
      return;
    }
    if (!isExpanded) {
      event.preventDefault();
      setIsExpanded(true);
    }
  };

  const handleClickAway = () => setIsExpanded(false);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        display="flex"
        flexDirection="row"
        gap={gutters(0.5)}
        alignItems="center"
        padding={gutters(0.5)}
        onMouseLeave={onLeave}
        onClick={handleClick}
        sx={{ pointerEvents: 'auto' }}
      >
        {childrenWithSeparator}
      </Box>
    </ClickAwayListener>
  );
};

export default Breadcrumbs;

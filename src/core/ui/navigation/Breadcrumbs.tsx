import React, {
  cloneElement,
  forwardRef,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Box, ClickAwayListener, Theme, useMediaQuery } from '@mui/material';
import { DoubleArrow } from '@mui/icons-material';
import { gutters } from '../grid/utils';
import { Expandable } from './Expandable';
import { some } from 'lodash';
import { Collapsible } from './Collapsible';
import { UncontrolledExpandable } from './UncontrolledExpandable';
import flattenChildren from '../utils/flattenChildren';

export type OneOrMany<Item> = Item | Item[];

export interface BreadcrumbsProps<ItemProps extends Expandable> extends UncontrolledExpandable {
  children?: OneOrMany<ReactElement<ItemProps> | false | null | undefined>;
}

interface BreadcrumbsInternalProps<ItemProps extends Expandable> extends UncontrolledExpandable {
  children?: OneOrMany<BreadcrumbsProps<ItemProps>['children']>;
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

const Breadcrumbs = forwardRef<Collapsible, BreadcrumbsInternalProps<Expandable>>(
  <ItemProps extends Expandable>({ onExpand, children }: BreadcrumbsInternalProps<ItemProps>, ref) => {
    const [expandedState, setExpandedState] = useState<JourneyBreadcrumbsExpandedState>({});
    const [isExpanded, setIsExpanded] = useState(false);

    const [firstChild, ...restChildren] = (flattenChildren(children) as ReactElement<ItemProps>[]).map(child => {
      const expanded = isExpanded || (child.key && expandedState[child.key]) || false;

      const onExpand = child.key ? () => handleItemHover(child.key!) : undefined;

      const onCollapse = child.key ? () => handleItemLeave(child.key!) : undefined;

      return cloneElement(child, { expanded, onExpand, onCollapse } as Partial<ItemProps>);
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
      setExpandedState(prevExpandedState => (some(prevExpandedState) ? {} : prevExpandedState));
    };

    const handleItemHover = (childKey: string | number) => {
      setExpandedState(prevExpandedState => ({
        ...prevExpandedState,
        [childKey]: true,
      }));
    };

    const handleItemLeave = (childKey: string | number) => {
      setExpandedState(prevExpandedState => ({
        ...prevExpandedState,
        [childKey]: false,
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

    useImperativeHandle(
      ref,
      () => {
        const collapse = () => {
          setExpandedState({});
          setIsExpanded(false);
        };

        return { collapse };
      },
      []
    );

    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          display="flex"
          flexDirection="row"
          columnGap={gutters(0.5)}
          rowGap={gutters(0.25)}
          alignItems="center"
          flexWrap="wrap"
          padding={gutters(0.5)}
          paddingRight={0}
          marginRight={gutters(2)}
          onMouseLeave={onLeave}
          onClick={handleClick}
          sx={{ pointerEvents: 'auto', userSelect: 'none' }}
        >
          {childrenWithSeparator}
        </Box>
      </ClickAwayListener>
    );
  }
) as <ItemProps extends Expandable>(
  props: BreadcrumbsInternalProps<ItemProps> & { ref?: Ref<Collapsible> }
) => ReactElement;

export default Breadcrumbs;

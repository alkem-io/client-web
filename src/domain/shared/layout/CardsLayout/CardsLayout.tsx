import React, { cloneElement, FC, ReactElement, useMemo } from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import { Identifiable } from '../../types/Identifiable';
import { CONTRIBUTION_CARD_WIDTH } from '../../components/ContributionCard/ContributionCardV2';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkCard from '../../../../components/core/LinkCard/LinkCard';
import Typography from '../../../../components/core/Typography';

interface CardsLayoutProps<Item extends Identifiable | null | undefined>
  extends CardLayoutContainerProps,
    CreateButtonProps {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
  showCreateButton?: boolean;
  createButtonLoading?: boolean;
}

/**
 * CardsLayout
 * @param items
 * @param children - a callback that renders a *single* item, pass null or undefined for an item that's loading
 * @param deps - deps to consider the render callback refreshed, as in useCallback(callback, deps)
 * @constructor
 */
const CardsLayout = <Item extends Identifiable | null | undefined>({
  items,
  children,
  deps = [],
  onCreateButtonClick,
  showCreateButton = false,
  ...layoutProps
}: CardsLayoutProps<Item>) => {
  const cards = useMemo(
    () =>
      items.map((item, index) => {
        const card = children(item);
        const key = item ? item.id : `__loading_${index}`;
        return cloneElement(card, { key });
      }),
    [items, ...deps]
  );

  return (
    <CardLayoutContainer {...layoutProps}>
      {showCreateButton && <CreateButton onCreateButtonClick={onCreateButtonClick}>Add</CreateButton>}
      {cards}
    </CardLayoutContainer>
  );
};

export default CardsLayout;

interface CardLayoutContainerProps extends BoxProps {}

export const CardLayoutContainer: FC<CardLayoutContainerProps> = ({ sx, children, ...boxProps }) => {
  return (
    <Box gap={2} {...boxProps} sx={{ display: 'flex', flexWrap: 'wrap', ...sx }}>
      {children}
    </Box>
  );
};

interface CardLayoutItemProps extends Pick<BoxProps, 'maxWidth' | 'flexGrow'> {
  flexBasis?: '25%' | '33%' | '50%';
}

/**
 * @deprecated - just render cards directly inside CardsLayout.
 */
export const CardLayoutItem: FC<CardLayoutItemProps> = ({ children, flexBasis = '25%', flexGrow, maxWidth }) => {
  return (
    <Box flexBasis={flexBasis} maxWidth={maxWidth} flexGrow={flexGrow}>
      {children}
    </Box>
  );
};

interface CreateButtonProps {
  onCreateButtonClick?: () => void;
}

const CreateButtonElement = styled(LinkCard)(({ theme }) => ({
  width: CONTRIBUTION_CARD_WIDTH,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.common.white,
  '& .MuiSvgIcon-root': {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
  },
}));

export const CreateButton: FC<CreateButtonProps> = ({ onCreateButtonClick, ...buttonProps }) => {
  return (
    <CreateButtonElement onClick={onCreateButtonClick} {...buttonProps}>
      <Typography variant="h1" weight="bold" color="primary">
        <AddCircleOutlineIcon width={20} />
      </Typography>
    </CreateButtonElement>
  );
};

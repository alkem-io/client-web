import React, { forwardRef, MouseEventHandler, PropsWithChildren } from 'react';
import { Paper, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';
import GridItem from '../grid/GridItem';
import RouterLink from '../link/RouterLink';
import ButtonBaseAlignReset from '../button/ButtonBaseAlignReset';

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

export interface ContributeCardProps {
  onClick?: MouseEventHandler;
  highlighted?: boolean;
  sx?: SxProps<Theme>;
  columns?: number;
  to?: string;
}

export const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = forwardRef<HTMLDivElement, PropsWithChildren<ContributeCardProps>>(
  ({ columns = CONTRIBUTE_CARD_COLUMNS, to, onClick, sx, highlighted, children }, ref) => {
    const content = to ? <RouterLink to={to}>{children}</RouterLink> : children;

    const getComponent = () => {
      if (onClick) {
        return ButtonBaseAlignReset;
      }
      if (to) {
        return RouterLink;
      }
      return Paper;
    };

    return (
      <GridItem columns={columns}>
        <ElevatedPaper
          component={getComponent()}
          sx={{
            background: theme => (highlighted ? theme.palette.background.default : theme.palette.background.paper),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            cursor: onClick ? 'pointer' : 'default',
            ...sx,
          }}
          onClick={onClick}
          to={to}
          ref={ref}
        >
          {content}
        </ElevatedPaper>
      </GridItem>
    );
  }
);

export default ContributeCard;

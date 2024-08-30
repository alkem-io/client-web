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
  state?: Record<string, unknown>;
  good?: boolean; //!! Remove this!
}

export const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = forwardRef<HTMLDivElement, PropsWithChildren<ContributeCardProps>>(
  ({ columns = CONTRIBUTE_CARD_COLUMNS, to, state, onClick, sx, highlighted, good, children }, ref) => {
    const getBaseComponentProps = () => {
      if (onClick) {
        return {
          component: ButtonBaseAlignReset,
          onClick,
        };
      }
      if (to) {
        return {
          component: RouterLink,
          to,
          state,
        };
      }
      return Paper;
    };

    return (
      <GridItem columns={columns}>
        <ElevatedPaper
          {...getBaseComponentProps()}
          sx={{
            background: theme => (highlighted ? theme.palette.background.default : theme.palette.background.paper),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            cursor: onClick || to ? 'pointer' : 'default',
            border: good ? '1px solid green' : undefined,
            ...sx,
          }}
          ref={ref}
        >
          {children}
        </ElevatedPaper>
      </GridItem>
    );
  }
);

export default ContributeCard;

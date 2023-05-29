import React, { forwardRef, PropsWithChildren } from 'react';
import { Paper, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';
import GridItem from '../grid/GridItem';
import RouterLink from '../link/RouterLink';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  highlighted?: boolean;
  sx?: SxProps<Theme>;
  columns?: number;
  to?: string;
}

export const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = forwardRef<HTMLDivElement, PropsWithChildren<ContributeCardProps>>(
  ({ columns = CONTRIBUTE_CARD_COLUMNS, to, onClick, sx, highlighted, children }, ref) => {
    const content = to ? <RouterLink to={to}>{children}</RouterLink> : children;

    return (
      <GridItem columns={columns}>
        <ElevatedPaper
          sx={{
            background: theme => (highlighted ? theme.palette.background.default : theme.palette.background.paper),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            cursor: onClick ? 'pointer' : 'default',
            ...sx,
          }}
          onClick={onClick}
          ref={ref}
        >
          {content}
        </ElevatedPaper>
      </GridItem>
    );
  }
);

export default ContributeCard;

import React, { forwardRef, PropsWithChildren } from 'react';
import { Paper, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';
import GridItem from '../grid/GridItem';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardContainerProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  highlighted?: boolean;
  sx?: SxProps<Theme>;
  columns?: number;
}

const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = forwardRef<HTMLDivElement, PropsWithChildren<ContributeCardContainerProps>>(
  ({ columns = CONTRIBUTE_CARD_COLUMNS, onClick, sx, highlighted, children }, ref) => {
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
          //className={highlighted ? 'highlighted' : undefined}
          onClick={onClick}
          ref={ref}
        >
          {children}
        </ElevatedPaper>
      </GridItem>
    );
  }
);

export default ContributeCard;

import { Paper, type SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { MouseEventHandler, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import withElevationOnHover from '@/domain/shared/components/withElevationOnHover';
import ButtonBaseAlignReset from '../button/ButtonBaseAlignReset';
import GridItem from '../grid/GridItem';
import RouterLink from '../link/RouterLink';

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

export interface ContributeCardProps {
  // if you use onClick, the children of this component should not be clickable elements! a11y 4.1.2
  onClick?: MouseEventHandler;
  highlighted?: boolean;
  isSelected?: boolean;
  sx?: SxProps<Theme>;
  columns?: number;
  to?: string;
  state?: Record<string, unknown>;
}

export const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = ({
  ref,
  columns = CONTRIBUTE_CARD_COLUMNS,
  to,
  state,
  onClick,
  sx,
  highlighted,
  children,
}: PropsWithChildren<ContributeCardProps> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const { t } = useTranslation();

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
    return {};
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
          ...sx,
        }}
        ref={ref}
        aria-label={t('common.contribute')}
      >
        {children}
      </ElevatedPaper>
    </GridItem>
  );
};

ContributeCard.displayName = 'ContributeCard';
export default ContributeCard;

import { MouseEventHandler, PropsWithChildren } from 'react';
import { Paper, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import withElevationOnHover from '@/domain/shared/components/withElevationOnHover';
import GridItem from '../grid/GridItem';
import RouterLink from '../link/RouterLink';
import ButtonBaseAlignReset from '../button/ButtonBaseAlignReset';
import { useTranslation } from 'react-i18next';

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

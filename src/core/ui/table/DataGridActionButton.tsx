import { IconButton, type IconButtonProps, type SvgIconProps, Tooltip } from '@mui/material';
import type { Identifiable } from '@/core/utils/Identifiable';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

const alwaysFalse = () => false;

interface DataGridActionButtonProps<Item extends Identifiable> extends Omit<IconButtonProps, 'onClick'> {
  item: Item;
  icon: React.ComponentType<SvgIconProps>;
  iconColor?: SvgIconProps['color'];
  tooltip?: string;
  onClick?: (item: Item) => Promise<unknown> | undefined;
  isDisabled?: (item: Item) => boolean;
}

const DataGridActionButton = <Item extends Identifiable>({
  item,
  icon: Icon,
  iconColor = 'primary',
  tooltip,
  onClick,
  isDisabled = alwaysFalse,
  ...props
}: DataGridActionButtonProps<Item>) => {
  const [handleClick, loading] = useLoadingState(async () => await onClick?.(item));

  return (
    <Tooltip title={tooltip} arrow={true}>
      <span>
        <IconButton onClick={handleClick} disabled={isDisabled(item)} aria-label={tooltip} loading={loading} {...props}>
          <Icon color={isDisabled(item) ? 'disabled' : iconColor} />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default DataGridActionButton;

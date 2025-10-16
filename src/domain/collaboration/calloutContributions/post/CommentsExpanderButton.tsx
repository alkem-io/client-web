import { gutters } from '@/core/ui/grid/utils';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { Button, ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CommentsExpanderButton = ({
  expanded,
  position,
  ...props
}: { expanded: boolean; position: 'bottom' | 'right' } & ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      sx={{
        borderRadius: 0,
        border: 0,
        ...(position === 'right' ? { width: gutters(), minWidth: gutters() } : undefined),
        ...(position === 'bottom' ? { height: gutters(), minHeight: gutters(), width: '100%' } : undefined),
        padding: 0,
        // Icon in the button must have preserveAspectRatio="none"
        '& > svg': {
          color: theme => theme.palette.divider,
          height: position === 'right' ? gutters(3) : gutters(),
          width: position === 'right' ? gutters() : gutters(3),
        },
      }}
      aria-label={
        expanded
          ? t('buttons.collapseEntity', { entity: t('common.comments') })
          : t('buttons.expandEntity', { entity: t('common.comments') })
      }
      title={
        expanded
          ? t('buttons.collapseEntity', { entity: t('common.comments') })
          : t('buttons.expandEntity', { entity: t('common.comments') })
      }
      aria-expanded={expanded}
      {...props}
    >
      {position === 'right' &&
        (expanded ? (
          <KeyboardDoubleArrowRightIcon preserveAspectRatio="none" />
        ) : (
          <KeyboardDoubleArrowLeftIcon preserveAspectRatio="none" />
        ))}
      {position === 'bottom' &&
        (expanded ? (
          <KeyboardDoubleArrowUpIcon preserveAspectRatio="none" />
        ) : (
          <KeyboardDoubleArrowDownIcon preserveAspectRatio="none" />
        ))}
    </Button>
  );
};

export default CommentsExpanderButton;

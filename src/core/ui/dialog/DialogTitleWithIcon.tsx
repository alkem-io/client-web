import { ReactNode, MouseEvent } from 'react';
import { styled } from '@mui/material/styles';
import MuiDialogTitle from '@mui/material/DialogTitle';
import { DialogTitleProps } from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { BlockTitle, Caption } from '../typography';
import { Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Root = styled(MuiDialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(3, 3, 2, 3),
  display: 'flex',
  alignItems: 'start',
}));

const Icon = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  width: theme.spacing(6),
  flex: `0 0 ${theme.spacing(6)}`,
  height: theme.spacing(6),
  marginRight: theme.spacing(2),
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export interface DialogTitleWithIconProps extends DialogTitleProps {
  icon?: ReactNode;
  subtitle?: ReactNode;
  onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * @deprecated - use DialogHeader
 */
const DialogTitleWithIcon = (props: DialogTitleWithIconProps) => {
  const { t } = useTranslation();
  const { children, classes, onClose, icon, subtitle, ...rest } = props;
  return (
    <>
      <Root component={Box} {...rest}>
        {icon && <Icon>{icon}</Icon>}
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <BlockTitle>{children}</BlockTitle>
          {subtitle ? <Caption>{subtitle}</Caption> : null}
        </Box>
        {onClose ? (
          <IconButton onClick={onClose} size="medium" aria-label={t('buttons.close')}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </Root>
      <Divider />
    </>
  );
};

export default DialogTitleWithIcon;

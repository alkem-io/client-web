import SendIcon from '@mui/icons-material/Send';
import { Button, type ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SendButton = ({ children, ...props }: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button startIcon={<SendIcon />} variant="contained" {...props}>
      {children ?? t('buttons.send')}
    </Button>
  );
};

export default SendButton;

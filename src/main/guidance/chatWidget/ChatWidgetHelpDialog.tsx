import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { Box, DialogProps, Typography } from '@mui/material';
import { gutters } from '../../../core/ui/grid/utils';
import { InfoOutlined } from '@mui/icons-material';
import Gutters from '../../../core/ui/grid/Gutters';
import { Text } from '../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

interface ChatWidgetHelpDialogProps extends DialogProps {
  onClose?: () => void;
}

const ChatWidgetHelpDialog = ({ onClose, ...props }: ChatWidgetHelpDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid columns={4} {...props} onClose={onClose} sx={{ zIndex: 10000 }}>
      <DialogHeader
        title={
          <Box display="flex" gap={1}>
            <Typography fontSize={gutters()} display="inline">
              <InfoOutlined fontSize="inherit" />
            </Typography>
            {t('chatbot.infoDialog.title')}
          </Box>
        }
        onClose={onClose}
      />
      <Gutters paddingTop={0}>
        <Text>{t('chatbot.infoDialog.content')}</Text>
      </Gutters>
    </DialogWithGrid>
  );
};

export default ChatWidgetHelpDialog;

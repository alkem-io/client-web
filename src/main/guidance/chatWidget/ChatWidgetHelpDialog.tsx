import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Box, DialogProps, Typography } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { InfoOutlined } from '@mui/icons-material';
import Gutters from '@/core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

interface ChatWidgetHelpDialogProps extends DialogProps {
  onClose?: () => void;
}

const ChatWidgetHelpDialog = ({ onClose, ...props }: ChatWidgetHelpDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid
      columns={4}
      {...props}
      onClose={onClose}
      sx={{ zIndex: 10000 }}
      aria-labelledby="chat-widget-help-dialog"
    >
      <DialogHeader
        id="chat-widget-help-dialog"
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
        <WrapperMarkdown caption disableParagraphPadding>
          {t('chatbot.infoDialog.content')}
        </WrapperMarkdown>
      </Gutters>
    </DialogWithGrid>
  );
};

export default ChatWidgetHelpDialog;

import { useTranslation } from 'react-i18next';
import { Box, IconButton } from '@mui/material';
import { gutters } from '../../../core/ui/grid/utils';
import { PageTitle } from '../../../core/ui/typography';
import SwapColors from '../../../core/ui/palette/SwapColors';
import { InfoOutlined } from '@mui/icons-material';

interface ChatWidgetTitleProps {
  onClickInfo?: () => void;
  mobile?: boolean;
}

const ChatWidgetTitle = ({ onClickInfo, mobile = false }: ChatWidgetTitleProps) => {
  const { t } = useTranslation();

  const infoButtonPosition = mobile ? 'left' : 'right';

  return (
    <Box display="flex" justifyContent="center" alignItems="center" position="relative" height={gutters(2.5)}>
      <PageTitle paddingTop={1}>{t('chatbot.title')}</PageTitle>
      <SwapColors>
        <IconButton
          size="small"
          color="primary"
          sx={{ position: 'absolute', top: 0, [infoButtonPosition]: 0 }}
          onClick={onClickInfo}
        >
          <InfoOutlined />
        </IconButton>
      </SwapColors>
    </Box>
  );
};

export default ChatWidgetTitle;

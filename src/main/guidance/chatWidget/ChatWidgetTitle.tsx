import { useTranslation } from 'react-i18next';
import { Box, IconButton } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { Caption, PageTitle } from '@/core/ui/typography';
import SwapColors from '@/core/ui/palette/SwapColors';
import { InfoOutlined } from '@mui/icons-material';

interface ChatWidgetTitleProps {
  onClickInfo?: () => void;
}

const ChatWidgetTitle = ({ onClickInfo }: ChatWidgetTitleProps) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height={gutters(2.5)}>
      <Box>
        <PageTitle position="relative">
          {t('chatbot.title')}
          <Caption
            position="absolute"
            top={0}
            left="100%"
            textTransform="uppercase"
            fontWeight="bold"
            lineHeight="1em"
            paddingX={0.2}
          >
            {t('common.beta')}
          </Caption>
        </PageTitle>
      </Box>
      <SwapColors>
        <IconButton
          size="small"
          color="primary"
          sx={{ position: 'absolute', top: 7, right: gutters(2) }}
          onClick={onClickInfo}
          aria-label={t('common.help')}
        >
          <InfoOutlined />
        </IconButton>
      </SwapColors>
    </Box>
  );
};

export default ChatWidgetTitle;

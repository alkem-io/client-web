import { EmailOutlined, GradeOutlined, NotListedLocationOutlined } from '@mui/icons-material';
import { Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import SwapColors from '@/core/ui/palette/SwapColors';
import ReferencesListSmallItem from '@/domain/common/reference/ReferencesListSmallItem';

const Icons = {
  GradeOutlined,
  NotListedLocationOutlined,
  EmailOutlined,
};

type ChatbotReferencesTranslation = {
  icon: string; // keyof typeof Icons;
  uri: string;
  title: string;
};

const ChatWidgetFooter = () => {
  const { t } = useTranslation();

  const referencesRaw = t('chatbot.references', { returnObjects: true });
  const references: ChatbotReferencesTranslation[] = Array.isArray(referencesRaw)
    ? referencesRaw
    : Object.values(referencesRaw);

  return (
    <SwapColors>
      <Paper square={true}>
        <Gutters sx={{ '.MuiSvgIcon-root': { fontSize: gutters() } }}>
          {references.map(({ uri, title, icon: iconName }, idx) => (
            <ReferencesListSmallItem key={idx} uri={uri} iconComponent={Icons[iconName]}>
              {title}
            </ReferencesListSmallItem>
          ))}
        </Gutters>
      </Paper>
    </SwapColors>
  );
};

export default ChatWidgetFooter;

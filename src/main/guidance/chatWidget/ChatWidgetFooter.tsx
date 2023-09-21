import Gutters from '../../../core/ui/grid/Gutters';
import ReferencesListSmallItem from '../../../domain/profile/Reference/ReferencesListSmallItem/ReferencesListSmallItem';
import { useTranslation } from 'react-i18next';
import SwapColors from '../../../core/ui/palette/SwapColors';
import { Paper } from '@mui/material';

const ChatWidgetFooter = () => {
  const { t } = useTranslation();

  const references = t('chatbot.references', { returnObjects: true });

  return (
    <SwapColors>
      <Paper square>
        <Gutters>
          {references.map(({ uri, title }) => (
            <ReferencesListSmallItem uri={uri}>{title}</ReferencesListSmallItem>
          ))}
        </Gutters>
      </Paper>
    </SwapColors>
  );
};

export default ChatWidgetFooter;

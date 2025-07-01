import TranslationKey from '@/core/i18n/utils/TranslationKey';
import EllipsableWithCount from '@/core/ui/typography/EllipsableWithCount';
import { useTranslation } from 'react-i18next';
import { CalloutModelLight } from '../../callout/models/CalloutModelLight';

type CalloutsListItemTitleProps = {
  callout: CalloutModelLight;
};

const SEPARATOR = ' — ';

const CalloutsListItemTitle = ({ callout }: CalloutsListItemTitleProps) => {
  const { t, i18n } = useTranslation();

  const [flowState] = callout.classification?.flowState?.tags ?? [];

  return (
    <EllipsableWithCount count={callout.activity}>
      {callout.framing.profile.displayName}
      {SEPARATOR}
      {flowState && (
        <strong>
          <>
            {i18n.exists(`common.enums.innovationFlowState.${flowState}`)
              ? t(`common.enums.innovationFlowState.${flowState}` as TranslationKey)
              : flowState}
          </>
        </strong>
      )}
    </EllipsableWithCount>
  );
};

export default CalloutsListItemTitle;

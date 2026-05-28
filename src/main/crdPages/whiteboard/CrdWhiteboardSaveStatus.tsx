import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { WhiteboardSaveStatus } from '@/crd/components/whiteboard/WhiteboardSaveStatus';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';

type CrdWhiteboardSaveStatusProps = {
  isSaved: boolean;
  date: Date | undefined;
};

/**
 * Integration wrapper for the CRD `WhiteboardSaveStatus` indicator. Owns the live elapsed-time
 * formatting (re-formatted on a 500ms tick via the domain `formatTimeElapsed` util) and composes the
 * status message, then hands plain props to the presentational CRD component.
 */
export const CrdWhiteboardSaveStatus = ({ isSaved, date }: CrdWhiteboardSaveStatusProps) => {
  const { t } = useTranslation();
  // Initialise synchronously (and refresh immediately in the effect below on date/t change) so the
  // message never interpolates an `undefined` datetime before the first interval tick.
  const [formattedTime, setFormattedTime] = useState<string>(() =>
    date ? formatTimeElapsed(date, t, 'long') : t('common.unknown')
  );

  useEffect(() => {
    const update = () => setFormattedTime(date ? formatTimeElapsed(date, t, 'long') : t('common.unknown'));
    update();
    const interval = setInterval(update, 500);

    return () => {
      clearInterval(interval);
    };
  }, [date, t]);

  const message = isSaved ? (
    t('pages.whiteboard.last-saved', { datetime: formattedTime })
  ) : (
    <Trans
      i18nKey="pages.whiteboard.unsuccessful-save"
      components={{ p: <p />, strong: <strong /> }}
      values={{ datetime: formattedTime, warningMessage: `${t('common.warning')}:` }}
    />
  );

  return <WhiteboardSaveStatus saved={isSaved} message={message} />;
};

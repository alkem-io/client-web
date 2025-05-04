import { Trans, useTranslation } from 'react-i18next';

const useTranslationWithLineBreaks = () => {
  const { t, i18n } = useTranslation();

  const tWithLineBreaks = (key: string, options?: Record<string, unknown>) => (
    <Trans values={options} t={t}>
      {key}
    </Trans>
  );

  return {
    t: tWithLineBreaks,
    i18n,
  };
};

export default useTranslationWithLineBreaks;

import { Trans, useTranslation } from 'react-i18next';

const useTranslationWithLineBreaks = () => {
  const { t, i18n } = useTranslation();

  const tWithLineBreaks: typeof t = (key, options) => {
    return (
      <Trans values={options} t={t}>
        {key}
      </Trans>
    );
  };

  return {
    t: tWithLineBreaks,
    i18n,
  };
};

export default useTranslationWithLineBreaks;

import { useApm } from '@/core/analytics/apm/context/useApm';
import { error as sentryError } from '@/core/logging/sentry/log';

const useImageErrorHandler = () => {
  const apm = useApm();

  const reportImageError = (src, err) => {
    const error = new Error(`Coulnd't load image src:'${src}' ${err}`);
    sentryError(error);
    apm?.captureError(error);
  };

  return reportImageError;
};

export default useImageErrorHandler;

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Loading = ({ text }: { text?: string }) => {
  const { t } = useTranslation();
  const resolvedText = text ?? t('common.loading');

  return (
    <div className="flex grow items-center justify-center gap-4 h-full text-primary">
      <Loader2 className="size-10 animate-spin" aria-hidden="true" />
      <span className="text-xs font-medium uppercase leading-none">{resolvedText}</span>
    </div>
  );
};

export default Loading;

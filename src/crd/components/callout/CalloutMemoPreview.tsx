import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';

type CalloutMemoPreviewProps = {
  content: string;
  onOpen: () => void;
  className?: string;
};

export function CalloutMemoPreview({ content, onOpen, className }: CalloutMemoPreviewProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('rounded-lg overflow-hidden border border-border bg-muted/30', className)}>
      <div className="p-4">
        <CroppedMarkdown content={content} maxHeight="16rem" />
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-2 flex justify-end">
        <Button variant="secondary" size="sm" onClick={onOpen}>
          {t('callout.openMemo')}
        </Button>
      </div>
    </div>
  );
}

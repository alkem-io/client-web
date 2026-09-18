import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CreatePostButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the create-callout ("Add Post") dialog. The consumer renders it only
 *  when the viewer has permission to create posts. */
export function CreatePostButton({ onClick, className }: CreatePostButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button className={cn('w-full gap-2 text-body-emphasis', className)} onClick={onClick}>
      <Plus className="w-4 h-4" aria-hidden="true" />
      {t('feed.addPost')}
    </Button>
  );
}

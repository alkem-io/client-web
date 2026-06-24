import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutsIndexListLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { PostIndexDialog } from '@/crd/components/callout/PostIndexDialog';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { mapPostIndexToListItems } from '../dataMappers/postIndexDataMapper';

type PostIndexDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutsSetId: string | undefined;
  classificationTagsets: ClassificationTagsetModel[];
  /** Section number used to build each post's deep link (`?section=N`). */
  tabSectionNumber: number;
};

/**
 * Wires the lazy Post Index query (feature 007) to the presentational dialog.
 * The query is fired only when the dialog opens — the heavy per-post metadata is
 * never fetched on tab load, only on demand here.
 */
export function PostIndexDialogConnector({
  open,
  onOpenChange,
  calloutsSetId,
  classificationTagsets,
  tabSectionNumber,
}: PostIndexDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const navigate = useNavigate();

  const [fetchIndex, { data, loading, called }] = useCalloutsIndexListLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  // `classificationTagsets` may be a fresh array reference each render, so the
  // effect keys on its serialized value (and parses it back inside) to avoid
  // re-firing the query on every render.
  const tagsetKey = JSON.stringify(classificationTagsetModelToTagsetArgs(classificationTagsets));

  useEffect(() => {
    if (open && calloutsSetId) {
      fetchIndex({ variables: { calloutsSetId, classificationTagsets: JSON.parse(tagsetKey) } });
    }
  }, [open, calloutsSetId, tagsetKey, fetchIndex]);

  const items = mapPostIndexToListItems(data?.lookup.calloutsSet?.callouts ?? [], tabSectionNumber, t);

  // Skeletons until the first result lands; once data exists, keep the list
  // visible through any background refetch instead of flashing placeholders.
  const isLoading = open && !data && (loading || !called);

  const handleItemClick = (id: string) => {
    const href = items.find(item => item.id === id)?.href;
    if (href) {
      onOpenChange(false);
      navigate(href);
    }
  };

  return (
    <PostIndexDialog
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      loading={isLoading}
      closeLabel={t('postIndexDialog.close')}
      labels={{
        title: t('sidebar.postIndex'),
        loadingLabel: t('postIndexDialog.loadingLabel'),
        empty: t('postIndexDialog.empty'),
      }}
      onItemClick={handleItemClick}
    />
  );
}

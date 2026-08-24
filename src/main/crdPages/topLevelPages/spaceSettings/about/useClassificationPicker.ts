import { useState } from 'react';
import {
  useClassificationTemplatesForSpaceQuery,
  useClassificationTemplatesPlatformWideQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type { ClassificationPickerSource } from '@/crd/components/classification/ClassificationPickerDialog';
import type { ClassificationTemplateOptionData } from '@/crd/components/classification/types';
import { mapGqlClassificationCardinality } from '@/domain/space/about/model/classificationCardinality';

type GqlTemplateOption = {
  id: string;
  profile: { displayName: string; description?: string | null };
  classification?: {
    cardinality: Parameters<typeof mapGqlClassificationCardinality>[0];
    values: ReadonlyArray<{ id: string; label: string }>;
  } | null;
};

function toOption(t: GqlTemplateOption): ClassificationTemplateOptionData {
  return {
    id: t.id,
    displayLabel: t.profile.displayName,
    description: t.profile.description ?? '',
    cardinality: t.classification ? mapGqlClassificationCardinality(t.classification.cardinality) : 'MULTI_SELECT',
    values: t.classification?.values.map(v => ({ id: v.id, label: v.label })) ?? [],
  };
}

export type UseClassificationPickerResult = {
  open: boolean;
  openPicker: () => void;
  closePicker: () => void;
  sources: ClassificationPickerSource[];
};

/**
 * Step A picker sources (FR-007) — every publicly-listed platform Template
 * Pack (FR-005b) plus the acting Space's TOP-LEVEL (root) Template Library
 * (FR-007a). Fetched only while the picker is open.
 */
export function useClassificationPicker(levelZeroSpaceId: string | undefined): UseClassificationPickerResult {
  const [open, setOpen] = useState(false);

  const { data: platformData, loading: platformLoading } = useClassificationTemplatesPlatformWideQuery({
    skip: !open,
  });
  const { data: spaceData, loading: spaceLoading } = useClassificationTemplatesForSpaceQuery({
    variables: { levelZeroSpaceId: levelZeroSpaceId ?? '' },
    skip: !open || !levelZeroSpaceId,
  });

  const platformTemplates = (platformData?.platform.library.templates ?? []).map(r => toOption(r.template));
  const spaceTemplates = (spaceData?.lookup.space?.templatesManager?.templatesSet?.classificationTemplates ?? []).map(
    toOption
  );

  const sources: ClassificationPickerSource[] = [
    { key: 'platform', templates: platformTemplates, loading: platformLoading },
    { key: 'space', templates: spaceTemplates, loading: spaceLoading },
  ];

  return {
    open,
    openPicker: () => setOpen(true),
    closePicker: () => setOpen(false),
    sources,
  };
}

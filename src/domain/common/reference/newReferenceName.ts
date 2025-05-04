import type { TFunction } from 'i18next';

export const newReferenceName = (t: TFunction<'translation', undefined>, count: number) =>
  t('components.referenceSegment.newReference', { count: count + 1 });

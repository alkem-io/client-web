import type { TFunction } from 'i18next';

export const newReferenceName = (t: TFunction, count: number) => {
  if (count === 0) {
    return t('components.referenceSegment.newReference');
  }

  return t('components.referenceSegment.newReference_plural', { count: count + 1 });
};

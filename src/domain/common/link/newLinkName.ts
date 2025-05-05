import type { TFunction } from 'i18next';

export const newLinkName = (t: TFunction, count: number) =>
  t('components.referenceSegment.newLink', { count: count + 1 });

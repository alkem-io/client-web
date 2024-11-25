import { TFunction } from 'react-i18next';

export const newLinkName = (t: TFunction<'translation', undefined>, count: number) =>
  t('components.referenceSegment.newLink', { count: count + 1 });

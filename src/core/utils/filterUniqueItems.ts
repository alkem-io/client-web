import { Identifiable } from './Identifiable';

export const filterUniqueItems = <T extends Identifiable>(allItems: T[], itemsToFilterOut: T[]): T[] => {
  const itemsToFilterOutSet = new Set(itemsToFilterOut.map(item => item.id));
  return allItems.filter(item => !itemsToFilterOutSet.has(item.id));
};

import { VisualType } from '@/core/apollo/generated/graphql-schema';

export function getVisualByType<T extends { name: string }>(type: VisualType, visualsArray?: T[]): T | undefined {
  const name = type.toLowerCase();
  return visualsArray?.find(x => x.name.toLowerCase() === name);
}

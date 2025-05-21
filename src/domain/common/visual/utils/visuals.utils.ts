import { VisualType } from '@/core/apollo/generated/graphql-schema';

export function getVisualByType<T extends { name: string }>(type: VisualType, visualsArray?: T[]): T | undefined {
  return visualsArray?.find(x => x.name === type);
}

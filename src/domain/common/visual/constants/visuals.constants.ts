import { VisualType } from '@core/apollo/generated/graphql-schema';
import { camelCase } from 'lodash';

export const VisualName: Record<VisualType, string> = {
  [VisualType.Avatar]: camelCase(VisualType.Avatar),
  [VisualType.Banner]: camelCase(VisualType.Banner),
  [VisualType.BannerWide]: camelCase(VisualType.BannerWide),
  [VisualType.Card]: camelCase(VisualType.Card),
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type VisualName = typeof VisualName[keyof typeof VisualName];

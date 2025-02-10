import { ExcalidrawElement } from '@alkemio/excalidraw/dist/excalidraw/element/types';
import { MergeWithCustomizer, mergeWith } from 'lodash';

export const mergeElements = (
  toBeMergedWith: ReadonlyArray<ExcalidrawElement>,
  toBeUsed: ReadonlyArray<ExcalidrawElement>
) => {
  const toBeUsedMap = new Map<string, ExcalidrawElement>(toBeUsed.map(x => [x.id, x]));
  return toBeMergedWith.map(x => mergeWith(x, toBeUsedMap.get(x.id), preferDestinationFields));
};

const preferDestinationFields: MergeWithCustomizer = (destValue: unknown, srcValue: unknown) => {
  // if the destination value is defined, prefer it instead of the source value
  return destValue === undefined ? srcValue : destValue;
};

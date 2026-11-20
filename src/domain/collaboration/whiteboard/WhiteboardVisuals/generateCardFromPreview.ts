import { VisualType } from '@/core/apollo/generated/graphql-schema';
import resizeImage from '@/core/utils/images/resizeImage';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import { fetchPreviewImageBlob } from './fetchPreviewImageBlob';
import type { WhiteboardPreviewImage } from './WhiteboardPreviewImagesModels';
import { CardVisualDimensions } from './WhiteboardVisualsDimensions';

/**
 * Derives the CARD visual from an already stored whiteboard preview, avoiding a full scene export.
 * Resolves to undefined when the stored preview cannot be loaded.
 */
const generateCardFromPreview = async (previewUri: string): Promise<WhiteboardPreviewImage[] | undefined> => {
  const blob = await fetchPreviewImageBlob(previewUri);
  if (!blob) return undefined;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();
  const card = await toBlobPromise(resizeImage(canvas, CardVisualDimensions), { type: 'image/png' });
  return [{ visualType: VisualType.Card, imageData: card }];
};

export default generateCardFromPreview;

import { VisualModel } from '@/domain/common/visual/model/VisualModel';

export interface MediaGalleryModel {
  id: string;
  visuals: (VisualModel & { sortOrder?: number })[] | undefined;
}

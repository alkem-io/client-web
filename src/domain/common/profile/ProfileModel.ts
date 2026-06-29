import type { LocationModelMapped } from '../location/LocationModelMapped';
import type { ReferenceModel } from '../reference/ReferenceModel';
import type { TagsetModel } from '../tagset/TagsetModel';
import type { VisualModel } from '../visual/model/VisualModel';

export interface ProfileModel {
  id: string;
  displayName: string;
  description?: string; // Markdown
  location?: LocationModelMapped;
  references?: ReferenceModel[];
  tagline?: string;
  tagsets?: TagsetModel[];
  tagset?: TagsetModel;
  visual?: VisualModel;
  visuals?: VisualModel[];
  url?: string;
}

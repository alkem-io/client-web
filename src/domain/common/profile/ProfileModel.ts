
import { TagsetModel } from '../tagset/TagsetModel';
import { LocationModel } from '../location/LocationModel';
import { ReferenceModel } from '../reference/ReferenceModel';
import { VisualModel } from '../visual/model/VisualModel';

export interface ProfileModel {
  id: string;
  displayName: string;
  description?: string; // Markdown
  location?: LocationModel;
  references?: ReferenceModel[];
  tagline?: string;
  tagsets?: TagsetModel[];
  visuals?: VisualModel[];
  url?: string;
}

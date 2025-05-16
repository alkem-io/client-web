
import { EmptyTagset, TagsetModel } from '../tagset/TagsetModel';
import { ReferenceModel } from '../reference/ReferenceModel';
import { VisualModel } from '../visual/model/VisualModel';
import { EmptyLocationMapped, LocationModelMapped } from '../location/LocationModelMapped';

export interface ProfileModel {
  id: string;
  displayName: string;
  description?: string; // Markdown
  location?: LocationModelMapped;
  references?: ReferenceModel[];
  tagline?: string;
  tagsets?: TagsetModel[];
  visuals?: VisualModel[];
  url?: string;
}

export const EmptyProfileModel: ProfileModel = {
  id: '',
  displayName: '',
  description: '',
  location: EmptyLocationMapped,
  references: [],
  tagline: '',
  tagsets: [EmptyTagset],
  visuals: [],
};

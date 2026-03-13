import { EmptyLocationMapped, type LocationModelMapped } from '../location/LocationModelMapped';
import type { ReferenceModel } from '../reference/ReferenceModel';
import { EmptyTagset, type TagsetModel } from '../tagset/TagsetModel';
import type { VisualModel, VisualModelFull } from '../visual/model/VisualModel';

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

export interface ProfileModelFull extends ProfileModel {
  visuals?: VisualModelFull[];
}

export const EmptyProfileModel: ProfileModelFull = {
  id: '',
  displayName: '',
  description: '',
  location: EmptyLocationMapped,
  references: [],
  tagline: '',
  tagsets: [EmptyTagset],
  visuals: [],
};

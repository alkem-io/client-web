import { EmptyTagset, TagsetModel } from '../tagset/TagsetModel';
import { ReferenceModel } from '../reference/ReferenceModel';
import { VisualModel, VisualModelFull } from '../visual/model/VisualModel';
import { EmptyLocationMapped, LocationModelMapped } from '../location/LocationModelMapped';

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

import { AdminSearchableTableItem } from '@/domain/platformAdmin/components/AdminSearchableTable';
import { SearchVisibility, SpacePrivacyMode, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

export interface InnovationPackTableItem extends AdminSearchableTableItem {
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
  accountOwner: string;
}

export interface InnovationHubTableItem extends AdminSearchableTableItem {
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
  accountOwner: string;
}

export interface VirtualContributorTableItem extends AdminSearchableTableItem {
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
  accountOwner: string;
}

export interface SpaceTableItem extends AdminSearchableTableItem {
  spaceId: string;
  nameId: string;
  visibility: SpaceVisibility;
  privacyMode: SpacePrivacyMode | undefined;
  accountOwner: string;
  canUpdate: boolean;
}

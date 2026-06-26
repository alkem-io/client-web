import {
  ActorType,
  ContributorCollectionView,
  type CreateCalloutContributorsSettingsInput,
} from '@/core/apollo/generated/graphql-schema';
import type { ContributorCollectionConfig, ContributorTypeId, ContributorViewId } from '@/crd/forms/callout/types';

/**
 * Pure mapping between the CRD callout form's contributor-collection config and
 * the server `ActorType` / `ContributorCollectionView` enums + the
 * `UpdateCalloutContributorsSettingsInput`. No Apollo, no side effects (feature
 * 008). The form uses a design-system-agnostic string union; this module is the
 * single boundary that bridges it to the generated GraphQL enums.
 */

const TYPE_ID_TO_SERVER: Record<ContributorTypeId, ActorType> = {
  user: ActorType.User,
  organization: ActorType.Organization,
  virtualContributor: ActorType.VirtualContributor,
};

// Only the contributor ActorType subtypes map back; the server never returns the
// others (SPACE/ACCOUNT/VIRTUAL_ASSISTANT) for a contributor-collection callout.
const SERVER_TO_TYPE_ID: Partial<Record<ActorType, ContributorTypeId>> = {
  [ActorType.User]: 'user',
  [ActorType.Organization]: 'organization',
  [ActorType.VirtualContributor]: 'virtualContributor',
};

const VIEW_ID_TO_SERVER: Record<ContributorViewId, ContributorCollectionView> = {
  list: ContributorCollectionView.List,
  map: ContributorCollectionView.Map,
};

const SERVER_TO_VIEW_ID: Record<ContributorCollectionView, ContributorViewId> = {
  [ContributorCollectionView.List]: 'list',
  [ContributorCollectionView.Map]: 'map',
};

export const contributorTypeToServer = (id: ContributorTypeId): ActorType => TYPE_ID_TO_SERVER[id];
export const contributorTypeFromServer = (type: ActorType): ContributorTypeId => SERVER_TO_TYPE_ID[type] ?? 'user';
export const contributorViewToServer = (id: ContributorViewId): ContributorCollectionView => VIEW_ID_TO_SERVER[id];
export const contributorViewFromServer = (view: ContributorCollectionView): ContributorViewId =>
  SERVER_TO_VIEW_ID[view];

/** Whether a contributor type can appear on the map (users/orgs locatable; VCs not). */
export const isLocatableType = (id: ContributorTypeId): boolean => id !== 'virtualContributor';

/** The default contributor-collection config: all three types, default USER/LIST. */
export const DEFAULT_CONTRIBUTOR_COLLECTION: ContributorCollectionConfig = {
  types: ['user', 'organization', 'virtualContributor'],
  defaultType: 'user',
  defaultView: 'list',
};

/**
 * Auto-heal the config so it always satisfies the server invariants:
 * - `defaultType` MUST be one of `types` (FR-006b) → falls back to the first.
 * - `defaultView` MUST be `list` when no locatable type remains (FR-006c).
 */
export const healContributorCollection = (config: ContributorCollectionConfig): ContributorCollectionConfig => {
  const types = config.types;
  const defaultType = types.includes(config.defaultType) ? config.defaultType : (types[0] ?? 'user');
  const hasLocatable = types.some(isLocatableType);
  const defaultView = hasLocatable ? config.defaultView : 'list';
  return { types, defaultType, defaultView };
};

// Build the server input from the (healed) form config. Typed as the CREATE
// input (contributorTypes REQUIRED) — the healed object always carries a
// non-empty selection, and this stricter type is assignable to the UPDATE
// framing field too, so one mapper serves both the create and update paths.
export const contributorCollectionToServer = (
  config: ContributorCollectionConfig
): CreateCalloutContributorsSettingsInput => {
  const healed = healContributorCollection(config);
  return {
    contributorTypes: healed.types.map(contributorTypeToServer),
    defaultContributorType: contributorTypeToServer(healed.defaultType),
    defaultView: contributorViewToServer(healed.defaultView),
  };
};

type ServerContributorsSettings =
  | {
      contributorTypes: ActorType[];
      defaultContributorType: ActorType;
      defaultView: ContributorCollectionView;
    }
  | null
  | undefined;

/** Prefill the form config from the server settings; defaults when absent. */
export const contributorCollectionFromServer = (settings: ServerContributorsSettings): ContributorCollectionConfig => {
  if (!settings) return { ...DEFAULT_CONTRIBUTOR_COLLECTION };
  return healContributorCollection({
    types: settings.contributorTypes.map(contributorTypeFromServer),
    defaultType: contributorTypeFromServer(settings.defaultContributorType),
    defaultView: contributorViewFromServer(settings.defaultView),
  });
};

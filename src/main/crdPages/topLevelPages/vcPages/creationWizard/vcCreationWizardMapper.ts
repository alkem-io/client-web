import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { VcWizardSelectableSpace } from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/** Minimal space shape needed by the wizard mappers (account spaces + subspaces). */
export type MappableSpace = {
  id: string;
  about?: { profile?: { displayName?: string; avatar?: { uri?: string } } };
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
  subspaces?: MappableSpace[];
};

/** A space the viewer can read (has the `Read` privilege). */
export const hasReadPrivilege = (space: Pick<MappableSpace, 'authorization'>): boolean =>
  space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

/** Maps an account space (with optional subspaces) to the CRD wizard's selectable shape. */
export const mapSpaceToSelectable = (space: MappableSpace, level: 'space' | 'subspace'): VcWizardSelectableSpace => ({
  id: space.id,
  displayName: space.about?.profile?.displayName ?? '',
  avatarUrl: space.about?.profile?.avatar?.uri || undefined,
  color: pickColorFromId(space.id),
  level,
  subspaces: space.subspaces?.map(s => mapSpaceToSelectable(s, 'subspace')),
});

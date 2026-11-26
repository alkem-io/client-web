import { useCreateSubspaceTemplateDefaultQuery } from '@/core/apollo/generated-v2/apollo-hooks';

const SUBSPACE_DEFAULT_SLOT = 'subspace_default';

/**
 * The subspace dialog's preselect (023 FR-020 "Default preselect"): the root space's `subspace_default`
 * binding. A bound template the caller cannot READ comes back as `template: null`, so nothing is preselected.
 */
export function useSubspaceDefaultTemplate(rootSpaceId: string | undefined, skip: boolean) {
  const { data, loading, error } = useCreateSubspaceTemplateDefaultQuery({
    variables: { root: rootSpaceId ?? '' },
    skip: skip || !rootSpaceId,
  });

  if (!skip && rootSpaceId && error) throw error;

  const template = skip
    ? undefined
    : data?.templateDefaults.find(entry => entry.slot === SUBSPACE_DEFAULT_SLOT)?.template;

  return {
    templateId: template?.id,
    templateName: template?.about.displayName,
    loading,
  };
}

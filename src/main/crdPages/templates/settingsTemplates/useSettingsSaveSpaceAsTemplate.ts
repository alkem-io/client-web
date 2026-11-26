import { type ApolloCache, ApolloError, useApolloClient } from '@apollo/client';
import { useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SettingsSaveAsResolveSourceDocument,
  SettingsSaveAsSourceDocument,
  useSettingsCreateSpaceTemplateMutation,
  useSettingsUpdateSpaceTemplateMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type {
  SettingsSaveAsResolveSourceQuery,
  SettingsSaveAsResolveSourceQueryVariables,
  SettingsSaveAsSourceQuery,
  SettingsSaveAsSourceQueryVariables,
} from '@/core/apollo/generated-v2/graphql-schema';
import type {
  SpaceTemplateFormProps,
  SpaceTemplateValues,
  TemplateCommonValues,
  TemplateContent,
  TemplateFormDialogProps,
  TemplateFormErrors,
} from '@/crd/components/templates/types';
import { mapLiveSpaceStructure } from './settingsTemplateMappers';
import { useReportTemplateFailure } from './useReportTemplateFailure';

/** The live space a "save as template" flow captures (the subspace of the Subspaces tab, or the settings' own space). */
export type SpaceSaveAsSource = { spaceId: string; name: string; description?: string; tags?: string[] };

type SourceDetails = {
  displayName: string;
  avatarUrl: string | undefined;
  canSaveAsTemplate: boolean;
  structure: Extract<TemplateContent, { type: 'space' }>;
};

type SourceSubtreeNode = NonNullable<SettingsSaveAsSourceQuery['subtree']>['edges'][number]['node'];

/** The template this dialog session already created, so a retry after a failed follow-up write never duplicates it. */
type CreatedTemplate = { id: string; source: string; recursive: boolean };

/**
 * A saved template changes the scope's `templates` lists (e.g. the Subspaces tab's default-template choices, read
 * only while its dialog is open): drop the cached lists so their next read asks the server.
 */
const dropCachedTemplateLists = (cache: ApolloCache<unknown>) => {
  cache.evict({ id: 'ROOT_QUERY', fieldName: 'templates' });
  cache.gc();
};

const emptyValues = (): SpaceTemplateValues => ({
  type: 'space',
  name: '',
  description: '',
  tags: [],
  recursive: true,
});

export type UseSettingsSaveSpaceAsTemplateArgs = {
  /** The destination catalogue: the top-level space (template libraries exist at top-level spaces, templates.md §1). */
  rootSpaceId: string;
  onSaved?: () => void;
};

export type UseSettingsSaveSpaceAsTemplateResult = {
  /** `TemplateFormDialog` props but its slot — the consumer renders `<TemplateFormDialog {...form} perTypeFormSlot=
   * {<SpaceTemplateForm {...spaceForm} />} />`. */
  form: Omit<TemplateFormDialogProps, 'perTypeFormSlot'>;
  spaceForm: SpaceTemplateFormProps;
  /** Opens the create dialog pre-filled from the space to capture. */
  openSaveAs: (source: SpaceSaveAsSource) => void;
};

/**
 * "Save a space as a template" on the space settings page (templates-screens "capture a space / content space as
 * template"): `createTemplate(scope: <top-level space>, kind: SPACE, source: <space>, recursive, about)`
 * (surface.graphql:615; templates.md §5.1), with the template's tags written by `updateTemplate(id, tags)`
 * (surface.graphql:616; createTemplate takes no tags). The source preview and the pasted-URL source pick are native
 * reads: `resolve(url)` and the source space's root-included `subtree`, gated by the source's `can.saveAsTemplate`
 * (A16.6, the one capture verdict). Same dialog, fields and messages as the `space` branch of `useTemplateForms`.
 */
export function useSettingsSaveSpaceAsTemplate({
  rootSpaceId,
  onSaved,
}: UseSettingsSaveSpaceAsTemplateArgs): UseSettingsSaveSpaceAsTemplateResult {
  const { t } = useTranslation('crd-templates');
  const client = useApolloClient();
  const report = useReportTemplateFailure();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SpaceTemplateValues>(emptyValues);
  const [errors, setErrors] = useState<TemplateFormErrors>({});
  const [pristine, setPristine] = useState(true);
  const [submitting, startSubmitting] = useTransition();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | undefined>(undefined);
  const [urlResolving, setUrlResolving] = useState(false);
  const [source, setSource] = useState<SourceDetails | undefined>(undefined);
  const [created, setCreated] = useState<CreatedTemplate | null>(null);
  const sourceRequestRef = useRef(0);

  const [createTemplate] = useSettingsCreateSpaceTemplateMutation({ update: dropCachedTemplateLists });
  const [updateTemplate] = useSettingsUpdateSpaceTemplateMutation({ update: dropCachedTemplateLists });

  /** Reads the source space (about, capture verdict) and its direct posts and subspaces; undefined when unreadable. */
  const loadSource = async (spaceId: string): Promise<SourceDetails | undefined> => {
    const nodes: SourceSubtreeNode[] = [];
    let space: Extract<NonNullable<SettingsSaveAsSourceQuery['node']>, { can: unknown }> | undefined;
    let after: string | undefined;
    for (;;) {
      const { data } = await client.query<SettingsSaveAsSourceQuery, SettingsSaveAsSourceQueryVariables>({
        query: SettingsSaveAsSourceDocument,
        variables: after ? { space: spaceId, after } : { space: spaceId },
      });
      if (!data.node || !('can' in data.node)) return undefined;
      space = data.node;
      if (!data.subtree) throw new Error(`Space ${spaceId} has no readable subtree`);
      nodes.push(...data.subtree.edges.map(edge => edge.node));
      const { hasNextPage, endCursor } = data.subtree.pageInfo;
      if (!hasNextPage) break;
      if (!endCursor || endCursor === after) {
        throw new Error(`Space ${spaceId} subtree continuation did not advance its opaque cursor`);
      }
      after = endCursor;
    }
    if (!space) return undefined;
    return {
      displayName: space.about.displayName,
      avatarUrl: space.about.avatar?.file.url || undefined,
      canSaveAsTemplate: space.can.saveAsTemplate,
      structure: mapLiveSpaceStructure(spaceId, nodes),
    };
  };

  const resetSourceState = () => {
    sourceRequestRef.current += 1;
    setUrl('');
    setUrlError(undefined);
    setUrlResolving(false);
    setSource(undefined);
  };

  const close = () => {
    setOpen(false);
    setErrors({});
    resetSourceState();
  };

  const openSaveAs = ({ spaceId, name, description, tags }: SpaceSaveAsSource) => {
    resetSourceState();
    setCreated(null);
    setValues({
      type: 'space',
      name,
      description: description ?? '',
      tags: tags ?? [],
      recursive: true,
      sourceSpaceId: spaceId,
    });
    setErrors({});
    setPristine(true);
    setOpen(true);
    // Back-fill the pre-set source's name, avatar and captured-structure preview.
    const request = sourceRequestRef.current;
    void loadSource(spaceId)
      .then(details => {
        if (sourceRequestRef.current === request) setSource(details);
      })
      .catch(cause => {
        if (sourceRequestRef.current === request) report(cause);
      });
  };

  const onUseUrl = async () => {
    setUrlError(undefined);
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError(t('form.space.urlLoader.errors.required'));
      return;
    }
    const request = ++sourceRequestRef.current;
    setUrlResolving(true);
    try {
      const { data } = await client.query<SettingsSaveAsResolveSourceQuery, SettingsSaveAsResolveSourceQueryVariables>({
        query: SettingsSaveAsResolveSourceDocument,
        variables: { url: trimmed },
        fetchPolicy: 'network-only',
      });
      const { state, remainder, node } = data.resolve;
      if (state === 'FORBIDDEN') {
        setUrlError(t('form.space.urlLoader.errors.noRights'));
        return;
      }
      if (state === 'NOT_FOUND' || !node) {
        setUrlError(t('form.space.urlLoader.errors.notFound'));
        return;
      }
      if (node.entityType !== 'space' || remainder.length > 0) {
        setUrlError(t('form.space.urlLoader.errors.invalidUrl'));
        return;
      }
      const details = await loadSource(node.id);
      if (sourceRequestRef.current !== request) return;
      if (!details) {
        setUrlError(t('form.space.urlLoader.errors.notFound'));
        return;
      }
      if (!details.canSaveAsTemplate) {
        setUrlError(t('form.space.urlLoader.errors.noRights'));
        return;
      }
      setSource(details);
      setValues(prev => ({ ...prev, sourceSpaceId: node.id }));
      setPristine(false);
      setUrl('');
    } catch (cause) {
      if (cause instanceof ApolloError) setUrlError(cause.message);
      else report(cause);
    } finally {
      setUrlResolving(false);
    }
  };

  const onSubmit = () => {
    const errs: TemplateFormErrors = {};
    if (!values.name.trim()) errs.name = t('form.common.nameRequired');
    if (!values.description.trim()) errs.description = t('form.common.descriptionRequired');
    if (!values.sourceSpaceId) errs.sourceSpaceId = t('form.space.sourceRequired');
    setErrors(errs);
    const sourceSpaceId = values.sourceSpaceId;
    if (Object.keys(errs).length > 0 || !sourceSpaceId) return;
    const current = values;
    const about = { displayName: current.name, description: current.description };
    startSubmitting(async () => {
      try {
        if (created) {
          const recapture = created.source !== sourceSpaceId || created.recursive !== current.recursive;
          await updateTemplate({
            variables: {
              id: created.id,
              about,
              tags: current.tags,
              ...(recapture ? { source: sourceSpaceId, recursive: current.recursive } : {}),
            },
          });
        } else {
          const { data } = await createTemplate({
            variables: { scope: rootSpaceId, source: sourceSpaceId, recursive: current.recursive, about },
          });
          if (!data) throw new Error('createTemplate returned no result');
          const id = data.createTemplate.node.id;
          setCreated({ id, source: sourceSpaceId, recursive: current.recursive });
          if (current.tags.length > 0) await updateTemplate({ variables: { id, tags: current.tags } });
        }
        close();
        onSaved?.();
      } catch (cause) {
        // Keep the dialog open; a retry updates the already-created template instead of creating another.
        report(cause);
      }
    });
  };

  const commonValue: TemplateCommonValues = { name: values.name, description: values.description, tags: values.tags };

  return {
    form: {
      open,
      intent: 'create',
      type: 'space',
      commonValue,
      commonErrors: errors,
      onCommonChange: next => {
        setPristine(false);
        setValues(prev => ({ ...prev, ...next }));
      },
      submitting,
      onSubmit,
      onCancel: close,
      isDirty: !pristine,
    },
    spaceForm: {
      value: values,
      errors,
      onChange: next => {
        setPristine(false);
        setValues(next);
      },
      url,
      onUrlChange: next => {
        setUrl(next);
        if (urlError) setUrlError(undefined);
      },
      onUseUrl: () => void onUseUrl(),
      urlResolving,
      urlError,
      sourceDisplayName: source?.displayName,
      sourceAvatarUrl: source?.avatarUrl,
      // Only preview a selected source; a stale preview must not linger after "Select another".
      capturedStructure: values.sourceSpaceId ? source?.structure : undefined,
    },
    openSaveAs,
  };
}

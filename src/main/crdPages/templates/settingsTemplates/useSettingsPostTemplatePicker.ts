import { useApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import {
  SettingsPostTemplateContentDocument,
  useSettingsPostTemplateLibraryQuery,
  useSettingsPostTemplatesQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type {
  SettingsPostTemplateContentQuery,
  SettingsPostTemplateContentQueryVariables,
} from '@/core/apollo/generated-v2/graphql-schema';
import type {
  TemplateCardData,
  TemplateContent,
  TemplatePickerSelectProps,
  TemplatePickerSource,
} from '@/crd/components/templates/types';
import type { UseTemplatePickerResult } from '../useTemplatePicker';
import {
  mapPostTemplateCard,
  mapPostTemplateContent,
  type PostLibraryTemplate,
  postAccountOwnerLabel,
  postPlatformOwnerLabel,
  type TemplateDocumentNode,
} from './settingsTemplateMappers';
import { useReportTemplateFailure } from './useReportTemplateFailure';

export type UseSettingsPostTemplatePickerArgs = {
  /** The top-level space whose own templates form the Space source (templates live at the top-level space). */
  rootSpaceId?: string;
  /** The account whose packs form the Account source. */
  accountId?: string;
};

/** One POST `library` source, following `pageInfo.endCursor` while `hasNextPage` (the picker has no paging UI). */
function usePostLibrarySource(scope: string | undefined, skip: boolean, report: (cause: unknown) => void) {
  const requestedCursor = useRef<string | null>(null);
  const [continuationError, setContinuationError] = useState<Error>();
  const variables = scope ? { scope } : {};
  const { data, loading, error, fetchMore } = useSettingsPostTemplateLibraryQuery({
    variables,
    skip,
    notifyOnNetworkStatusChange: true,
  });

  const connection = skip ? undefined : data?.library;
  const hasNextPage = connection?.pageInfo.hasNextPage ?? false;
  const endCursor = connection?.pageInfo.endCursor ?? null;
  const stalled = hasNextPage && !endCursor;
  const failed = Boolean(error || continuationError || stalled);

  useEffect(() => {
    if (skip) return;
    if (error) report(error);
  }, [skip, error]);
  useEffect(() => {
    if (continuationError) report(continuationError);
  }, [continuationError]);
  useEffect(() => {
    if (stalled) report(new Error('Template library continuation is missing its opaque cursor'));
  }, [stalled]);

  useEffect(() => {
    if (skip || loading || failed || !hasNextPage || !endCursor || requestedCursor.current === endCursor) return;
    const after = endCursor;
    requestedCursor.current = after;
    fetchMore({ variables: { ...variables, after } })
      .then(result => {
        const pageInfo = result.data.library.pageInfo;
        if (pageInfo.hasNextPage && (!pageInfo.endCursor || pageInfo.endCursor === after)) {
          throw new Error('Template library continuation did not advance its opaque cursor');
        }
      })
      .catch(cause => {
        setContinuationError(cause instanceof Error ? cause : new Error('Template library continuation failed'));
      });
  });

  const templates: PostLibraryTemplate[] = (connection?.edges ?? []).map(edge => {
    if (!('kind' in edge.node)) throw new Error('Template library returned a node that is not a template');
    return edge.node;
  });

  return { templates, loading: !skip && !failed && (loading || hasNextPage) };
}

/**
 * The Layout tab's default-post-template picker (templates-screens "set / clear phase default post template"): the
 * `mode: 'select'` picker with `allowedTypes: ['callout']`, same result shape and behaviour as `useTemplatePicker`, on
 * the native reads — the top-level space's `templates(kind: POST)`, the account's and the platform's POST `library`,
 * and the template body through `node` + `subtree` for the preview.
 */
export function useSettingsPostTemplatePicker({
  rootSpaceId,
  accountId,
}: UseSettingsPostTemplatePickerArgs): UseTemplatePickerResult {
  const client = useApolloClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    content: TemplateContent | null;
  } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);
  const report = useReportTemplateFailure();

  const {
    data: spaceData,
    loading: spaceLoading,
    error: spaceError,
  } = useSettingsPostTemplatesQuery({
    fetchPolicy: 'network-only',
    variables: { space: rootSpaceId ?? '' },
    skip: !open || !rootSpaceId,
  });
  const account = usePostLibrarySource(accountId, !open || !accountId, report);
  const platform = usePostLibrarySource(undefined, !open, report);

  useEffect(() => {
    if (open && rootSpaceId && spaceError) report(spaceError);
  }, [open, rootSpaceId, spaceError]);

  const spaceTemplates: TemplateCardData[] = (spaceData?.templates ?? []).map(t => mapPostTemplateCard(t));
  const accountTemplates = account.templates.map(t => mapPostTemplateCard(t, postAccountOwnerLabel(t)));
  const platformTemplates = platform.templates.map(t => mapPostTemplateCard(t, postPlatformOwnerLabel(t)));

  const sources: TemplatePickerSource[] = [];
  if (rootSpaceId) sources.push({ key: 'space', templates: spaceTemplates, loading: spaceLoading });
  if (accountId) sources.push({ key: 'account', templates: accountTemplates, loading: account.loading });
  sources.push({ key: 'platform', templates: platformTemplates, loading: platform.loading });

  /** Reads a POST template's body post and the documents under it; undefined when the template is not readable. */
  const fetchPostTemplate = async (templateId: string): Promise<TemplateContent | undefined> => {
    const documents: TemplateDocumentNode[] = [];
    let after: string | undefined;
    for (;;) {
      const { data } = await client.query<SettingsPostTemplateContentQuery, SettingsPostTemplateContentQueryVariables>({
        query: SettingsPostTemplateContentDocument,
        variables: after ? { template: templateId, after } : { template: templateId },
      });
      const template = data.node;
      if (!template || !('kind' in template)) return undefined;
      const body = template.body && 'contentKind' in template.body ? template.body : undefined;
      if (!body) throw new Error(`Post template ${templateId} has no readable body post`);
      if (!data.subtree) throw new Error(`Post template ${templateId} has no readable subtree`);
      for (const edge of data.subtree.edges) {
        if ('role' in edge.node) documents.push(edge.node);
      }
      const { hasNextPage, endCursor } = data.subtree.pageInfo;
      if (!hasNextPage) return mapPostTemplateContent({ body, documents });
      if (!endCursor || endCursor === after) {
        throw new Error(`Post template ${templateId} subtree continuation did not advance its opaque cursor`);
      }
      after = endCursor;
    }
  };

  // Tracks the latest preview request so a slow response for template A doesn't overwrite the
  // content shown for template B if the user previewed another card mid-fetch.
  const activePreviewIdRef = useRef<string | null>(null);
  const selectionRequestRef = useRef(0);

  const onPreview = (templateId: string) => {
    activePreviewIdRef.current = templateId;
    setPreviewId(templateId);
    setPreviewContent(undefined);
    setPreviewLoading(true);
    void fetchPostTemplate(templateId)
      .then(content => {
        if (activePreviewIdRef.current !== templateId) return;
        setPreviewContent(content);
      })
      .catch(cause => {
        if (activePreviewIdRef.current !== templateId) return;
        setPreviewContent(undefined);
        report(cause);
      })
      .finally(() => {
        if (activePreviewIdRef.current === templateId) setPreviewLoading(false);
      });
  };

  const onSelect = (templateId: string | null) => {
    const request = ++selectionRequestRef.current;
    if (templateId === null) {
      setSelectedTemplate(null);
      setOpen(false);
      return;
    }
    setSelectedTemplate({ id: templateId, content: null });
    setOpen(false);
    void fetchPostTemplate(templateId)
      .then(content => {
        if (selectionRequestRef.current !== request) return;
        setSelectedTemplate(content ? { id: templateId, content } : null);
      })
      .catch(cause => {
        if (selectionRequestRef.current !== request) return;
        setSelectedTemplate(null);
        report(cause);
      });
  };

  const clearSelection = () => {
    selectionRequestRef.current += 1;
    setSelectedTemplate(null);
  };

  const pickerProps: TemplatePickerSelectProps = {
    mode: 'select',
    open,
    onClose: () => setOpen(false),
    sources,
    search,
    onSearchChange: setSearch,
    loading: false,
    onPreview,
    previewId: previewId ?? undefined,
    previewContent: previewId ? previewContent : undefined,
    previewLoading,
    allowedTypes: ['callout'],
    // Single-pick-then-apply, as useTemplatePicker: the picker UI never retains a selected state.
    selectedId: undefined,
    onSelect,
  };

  return {
    openPicker: () => {
      setSearch('');
      setPreviewId(null);
      setPreviewContent(undefined);
      setOpen(true);
    },
    pickerProps,
    selectedTemplateId: selectedTemplate?.id ?? null,
    selectedTemplateContent: selectedTemplate?.content ?? null,
    clearSelection,
  };
}

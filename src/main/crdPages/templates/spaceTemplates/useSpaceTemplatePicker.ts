import { ApolloError, useApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreateSpaceTemplateContentDocument,
  useCreateSpacePickerLibraryQuery,
  useCreateSpacePickerSpaceTemplatesQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type {
  CreateSpaceTemplateContentQuery,
  CreateSpaceTemplateContentQueryVariables,
} from '@/core/apollo/generated-v2/graphql-schema';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type {
  TemplateCardData,
  TemplateContent,
  TemplatePickerSelectProps,
  TemplatePickerSource,
} from '@/crd/components/templates/types';
import type { UseTemplatePickerResult } from '../useTemplatePicker';
import {
  accountOwnerLabel,
  type LibraryTemplate,
  mapSpaceTemplateCard,
  mapSpaceTemplateContent,
  type NativeSpaceTemplate,
  platformOwnerLabel,
  type SpaceTemplatePrefill,
  spaceTemplatePrefill,
} from './spaceTemplateMappers';

export type FetchedSpaceTemplate = {
  content: Extract<TemplateContent, { type: 'space' }>;
  prefill: SpaceTemplatePrefill;
};

export type UseSpaceTemplatePickerArgs = {
  /** The root (L0) space whose own templates form the Space source; the subspace dialog only. */
  rootSpaceId?: string;
  /** The account whose packs form the Account source. */
  accountId?: string;
  /** Optional external open-control. When `open` is provided the hook is controlled (no internal open state). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type UseSpaceTemplatePickerResult = UseTemplatePickerResult & {
  /** Reads a space template's body (preview and prefill); undefined when the template is not readable. */
  fetchSpaceTemplate: (templateId: string) => Promise<FetchedSpaceTemplate | undefined>;
};

/**
 * Reports a failed picker read the way legacy's global error link did for the same reads: a notification, with
 * the picker left usable. The native client has no global error link, and a failed optional read inside a modal
 * must not take down the page that hosts it.
 */
function useReportFailure() {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  return (cause: unknown) => {
    if (cause instanceof ApolloError) {
      handleError(cause);
      return;
    }
    logError(cause instanceof Error ? cause : new Error(String(cause)));
    notify(t('apollo.errors.generic'), 'error');
  };
}

/** One `library` source, following `pageInfo.endCursor` while `hasNextPage` (the picker has no paging UI). */
function useLibrarySource(scope: string | undefined, skip: boolean, report: (cause: unknown) => void) {
  const requestedCursor = useRef<string | null>(null);
  const [continuationError, setContinuationError] = useState<Error>();
  const variables = scope ? { scope } : {};
  const { data, loading, error, fetchMore } = useCreateSpacePickerLibraryQuery({
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

  const templates: LibraryTemplate[] = (connection?.edges ?? []).map(edge => {
    if (!('kind' in edge.node)) throw new Error('Template library returned a node that is not a template');
    return edge.node;
  });

  return { templates, loading: !skip && !failed && (loading || hasNextPage) };
}

/**
 * The `mode: 'select'` space template picker of the create dialogs (023 FR-020, RF2 item 9).
 * Same result shape and behaviour as `useTemplatePicker` with `allowedTypes: ['space']`, on the native reads:
 * the root space's own `templates`, the account's and the platform's `library`, and the template body
 * through `node` + `subtree`.
 */
export function useSpaceTemplatePicker({
  rootSpaceId,
  accountId,
  open: controlledOpen,
  onOpenChange,
}: UseSpaceTemplatePickerArgs): UseSpaceTemplatePickerResult {
  const client = useApolloClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    content: TemplateContent | null;
  } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);
  const report = useReportFailure();

  const {
    data: spaceData,
    loading: spaceLoading,
    error: spaceError,
  } = useCreateSpacePickerSpaceTemplatesQuery({
    fetchPolicy: 'network-only',
    variables: { space: rootSpaceId ?? '' },
    skip: !open || !rootSpaceId,
  });
  const account = useLibrarySource(accountId, !open || !accountId, report);
  const platform = useLibrarySource(undefined, !open, report);

  useEffect(() => {
    if (open && rootSpaceId && spaceError) report(spaceError);
  }, [open, rootSpaceId, spaceError]);

  const spaceTemplates: TemplateCardData[] = (spaceData?.templates ?? []).map(t => mapSpaceTemplateCard(t));
  const accountTemplates = account.templates.map(t => mapSpaceTemplateCard(t, accountOwnerLabel(t)));
  const platformTemplates = platform.templates.map(t => mapSpaceTemplateCard(t, platformOwnerLabel(t)));

  const sources: TemplatePickerSource[] = [];
  if (rootSpaceId) sources.push({ key: 'space', templates: spaceTemplates, loading: spaceLoading });
  if (accountId) sources.push({ key: 'account', templates: accountTemplates, loading: account.loading });
  sources.push({ key: 'platform', templates: platformTemplates, loading: platform.loading });

  const fetchSpaceTemplate = async (templateId: string): Promise<FetchedSpaceTemplate | undefined> => {
    const nodes: NativeSpaceTemplate['nodes'] = [];
    let after: string | undefined;
    for (;;) {
      const { data } = await client.query<CreateSpaceTemplateContentQuery, CreateSpaceTemplateContentQueryVariables>({
        query: CreateSpaceTemplateContentDocument,
        variables: after ? { template: templateId, after } : { template: templateId },
      });
      const template = data.node;
      if (!template || !('about' in template)) return undefined;
      if (!data.subtree) throw new Error(`Space template ${templateId} has no readable subtree`);
      nodes.push(...data.subtree.edges.map(edge => edge.node));
      const { hasNextPage, endCursor } = data.subtree.pageInfo;
      if (!hasNextPage) {
        const native = { template, nodes };
        return { content: mapSpaceTemplateContent(native), prefill: spaceTemplatePrefill(native) };
      }
      if (!endCursor || endCursor === after) {
        throw new Error(`Space template ${templateId} subtree continuation did not advance its opaque cursor`);
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
    void fetchSpaceTemplate(templateId)
      .then(fetched => {
        if (activePreviewIdRef.current !== templateId) return;
        setPreviewContent(fetched?.content);
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
    void fetchSpaceTemplate(templateId)
      .then(fetched => {
        if (selectionRequestRef.current !== request) return;
        setSelectedTemplate(fetched ? { id: templateId, content: fetched.content } : null);
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
    allowedTypes: ['space'],
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
    fetchSpaceTemplate,
  };
}

import { useRef, useState } from 'react';
import {
  useImportTemplateDialogAccountTemplatesQuery,
  useImportTemplateDialogPlatformTemplatesQuery,
  useImportTemplateDialogQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  ImportTemplateDialogAccountTemplatesQuery,
  ImportTemplateDialogPlatformTemplatesQuery,
  ImportTemplateDialogQuery,
} from '@/core/apollo/generated/graphql-schema';
import type {
  TemplateCardData,
  TemplateContent,
  TemplatePickerSelectProps,
  TemplatePickerSource,
  TemplateType,
} from '@/crd/components/templates/types';
import { mapGqlTemplateType, mapTemplateToCardData, toGqlTemplateType } from './templateCardMapper';
import { mapTemplateContent, templateContentIncludeVars } from './templateContentMapper';

/** A single import-dialog `Template` row — the Space/Account/Platform queries all share this shape. */
type ImportDialogTemplate = NonNullable<ImportTemplateDialogQuery['lookup']['templatesSet']>['templates'][number];
type AccountInnovationPack = NonNullable<
  NonNullable<ImportTemplateDialogAccountTemplatesQuery['lookup']['account']>['innovationPacks']
>[number];
type PlatformTemplateResult = ImportTemplateDialogPlatformTemplatesQuery['platform']['library']['templates'][number];

const cardFromImportTemplate = (t: ImportDialogTemplate, ownerLabel?: string): TemplateCardData =>
  mapTemplateToCardData(t, ownerLabel);

export type UseTemplatePickerArgs = {
  allowedTypes: TemplateType[];
  /** The current space's templates set, if in a space context (for the Space source section). */
  spaceTemplatesSetId?: string;
  accountId?: string;
  /** Optional external open-control. When `open` is provided the hook is controlled (no internal open state). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type UseTemplatePickerResult = {
  openPicker: () => void;
  pickerProps: TemplatePickerSelectProps;
  selectedTemplateId: string | null;
  selectedTemplateContent: TemplateContent | null;
  clearSelection: () => void;
};

/**
 * The `mode: 'select'` template picker hook used by all consumption flows.
 * Loads Space / Account / Platform sources filtered to `allowedTypes`, lazy-loads content for the
 * preview pane and (on selection) for the consumer to pre-fill its form.
 */
export function useTemplatePicker({
  allowedTypes,
  spaceTemplatesSetId,
  accountId,
  open: controlledOpen,
  onOpenChange,
}: UseTemplatePickerArgs): UseTemplatePickerResult {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [search, setSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<TemplateContent | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);

  const primaryType = allowedTypes[0];
  const allowedTypeSet = new Set<TemplateType>(allowedTypes);
  const includeForPrimary = primaryType ? templateContentIncludeVars(primaryType) : undefined;
  const includeCallout = Boolean(includeForPrimary?.includeCallout);
  const includeSpace = Boolean(includeForPrimary?.includeSpace);

  const { data: spaceData, loading: spaceLoading } = useImportTemplateDialogQuery({
    fetchPolicy: 'network-only',
    variables: { templatesSetId: spaceTemplatesSetId ?? '', includeCallout, includeSpace },
    skip: !open || !spaceTemplatesSetId,
  });

  const { data: accountData, loading: accountLoading } = useImportTemplateDialogAccountTemplatesQuery({
    variables: { accountId: accountId ?? '', includeCallout, includeSpace },
    skip: !open || !accountId,
  });

  const { data: platformData, loading: platformLoading } = useImportTemplateDialogPlatformTemplatesQuery({
    variables: { templateTypes: allowedTypes.map(toGqlTemplateType), includeCallout, includeSpace },
    skip: !open,
  });

  const [getTemplateContent] = useTemplateContentLazyQuery();

  const matchesType = (t: ImportDialogTemplate) => allowedTypeSet.has(mapGqlTemplateType(t.type));

  const spaceTemplates: TemplateCardData[] = (spaceData?.lookup.templatesSet?.templates ?? [])
    .filter(matchesType)
    .map(t => cardFromImportTemplate(t));
  const accountTemplates: TemplateCardData[] = (accountData?.lookup.account?.innovationPacks ?? []).flatMap(
    (pack: AccountInnovationPack) =>
      (pack.templatesSet?.templates ?? [])
        .filter(matchesType)
        .map(t => cardFromImportTemplate(t, pack.profile.displayName))
  );
  const platformTemplates: TemplateCardData[] = (platformData?.platform.library.templates ?? []).map(
    (result: PlatformTemplateResult) =>
      cardFromImportTemplate(
        result.template,
        result.innovationPack.provider.profile?.displayName ?? result.innovationPack.profile.displayName
      )
  );

  const sources: TemplatePickerSource[] = [];
  if (spaceTemplatesSetId) sources.push({ key: 'space', templates: spaceTemplates, loading: spaceLoading });
  if (accountId) sources.push({ key: 'account', templates: accountTemplates, loading: accountLoading });
  sources.push({ key: 'platform', templates: platformTemplates, loading: platformLoading });

  const fetchContent = async (
    templateId: string,
    set: (c: TemplateContent | undefined) => void,
    setLoading: (b: boolean) => void
  ) => {
    if (!primaryType) return;
    setLoading(true);
    set(undefined);
    try {
      const { data } = await getTemplateContent({
        variables: { templateId, ...templateContentIncludeVars(primaryType) },
      });
      const fetched = data?.lookup.template;
      if (fetched) set(mapTemplateContent(fetched, primaryType));
    } finally {
      setLoading(false);
    }
  };

  // Tracks the latest preview request so a slow response for template A doesn't overwrite the
  // content shown for template B if the user previewed another card mid-fetch. `previewId` drives a
  // committing action (Use/Import) in the preview pane, so a stale overwrite could apply the wrong template.
  const activePreviewIdRef = useRef<string | null>(null);

  const onPreview = (templateId: string) => {
    if (!primaryType) return;
    activePreviewIdRef.current = templateId;
    setPreviewId(templateId);
    setPreviewContent(undefined);
    setPreviewLoading(true);
    void getTemplateContent({ variables: { templateId, ...templateContentIncludeVars(primaryType) } })
      .then(({ data }) => {
        if (activePreviewIdRef.current !== templateId) return;
        const fetched = data?.lookup.template;
        setPreviewContent(fetched ? mapTemplateContent(fetched, primaryType) : undefined);
      })
      .catch(() => {
        // The request failed (network / auth / GraphQL). Leave the (already-cleared) preview empty
        // rather than an ambiguous half-loaded state; the error itself surfaces via the Apollo error
        // link / global handler.
        if (activePreviewIdRef.current === templateId) setPreviewContent(undefined);
      })
      .finally(() => {
        if (activePreviewIdRef.current === templateId) setPreviewLoading(false);
      });
  };

  const onSelect = (templateId: string | null) => {
    if (templateId === null) {
      setSelectedTemplateId(null);
      setSelectedTemplateContent(null);
      setOpen(false);
      return;
    }
    setSelectedTemplateId(templateId);
    setOpen(false);
    void fetchContent(
      templateId,
      c => setSelectedTemplateContent(c ?? null),
      () => {}
    );
  };

  const clearSelection = () => {
    setSelectedTemplateId(null);
    setSelectedTemplateContent(null);
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
    allowedTypes,
    // The "select" picker is single-pick-then-apply: the pick is transient — the caller consumes it
    // once (via `selectedTemplateId` / `selectedTemplateContent`) and then it's done. The picker UI must
    // not retain a "selected" state, so every "Use this template" button stays a plain action button and
    // reopening the dialog shows nothing pre-selected.
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
    selectedTemplateId,
    selectedTemplateContent,
    clearSelection,
  };
}

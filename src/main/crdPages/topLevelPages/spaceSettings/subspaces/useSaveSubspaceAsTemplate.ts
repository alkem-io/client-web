import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateTemplateFromSpaceMutation,
  useSpaceTemplateContentLazyQuery,
  useSpaceTemplateContentQuery,
  useUrlResolverLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, UrlType } from '@/core/apollo/generated/graphql-schema';
import type {
  SaveAsTemplateFieldErrors,
  SaveAsTemplateFormValues,
  SaveAsTemplatePreview,
  SaveAsTemplateUrlLoaderState,
} from '@/crd/components/space/settings/SaveSubspaceAsTemplateDialog';

export type UseSaveSubspaceAsTemplateResult = {
  open: boolean;
  /** Name of the subspace the kebab was opened from (just for the subtitle). */
  subspaceName: string;
  /** Name of the space whose content is currently being captured (may differ from subspaceName after a URL swap). */
  activeSpaceName: string;
  values: SaveAsTemplateFormValues;
  errors: SaveAsTemplateFieldErrors;
  submitting: boolean;
  canSubmit: boolean;
  preview: SaveAsTemplatePreview;
  previewLoading: boolean;
  urlLoader: SaveAsTemplateUrlLoaderState;
  onOpen: (args: { subspaceId: string; subspaceName: string }) => void;
  onClose: () => void;
  onChange: (patch: Partial<SaveAsTemplateFormValues>) => void;
  onSubmit: () => Promise<void>;
  onOpenUrlLoader: () => void;
  onCloseUrlLoader: () => void;
  onUrlChange: (next: string) => void;
  onUseUrl: () => Promise<void>;
};

const EMPTY: SaveAsTemplateFormValues = {
  displayName: '',
  description: '',
  tags: [],
  recursive: true,
};

/**
 * Drives the CRD `SaveSubspaceAsTemplateDialog`. Mirrors the MUI
 * `CreateSpaceTemplateDialog` + `TemplateSpaceForm` flow:
 * - Starts with empty profile fields (not pre-filled from the subspace).
 * - Allows the user to swap the source space via URL ("Update collaboration
 *   from another space" in the MUI UI) — requires Update privilege on the
 *   pasted space.
 * - Preview reflects whichever space is currently active.
 */
export function useSaveSubspaceAsTemplate({
  templatesSetId,
  onSaved,
}: {
  templatesSetId: string | undefined;
  onSaved?: () => void;
}): UseSaveSubspaceAsTemplateResult {
  const { t } = useTranslation('crd-spaceSettings');

  const [open, setOpen] = useState(false);
  const [subspaceName, setSubspaceName] = useState<string>('');
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  const [values, setValues] = useState<SaveAsTemplateFormValues>(EMPTY);
  const [errors, setErrors] = useState<SaveAsTemplateFieldErrors>({});

  const [urlLoaderOpen, setUrlLoaderOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | undefined>(undefined);
  const [resolving, setResolving] = useState(false);

  const [createTemplateFromSpace, { loading: submitting }] = useCreateTemplateFromSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [parseUrl] = useUrlResolverLazyQuery();
  const [fetchSpaceContent] = useSpaceTemplateContentLazyQuery();

  const { data: previewData, loading: previewLoading } = useSpaceTemplateContentQuery({
    variables: { spaceId: activeSpaceId },
    skip: !open || !activeSpaceId,
  });

  const previewSpace = previewData?.lookup.space;
  const activeSpaceName = previewSpace?.about?.profile?.displayName ?? subspaceName;
  const preview: SaveAsTemplatePreview = {
    states: (previewSpace?.collaboration?.innovationFlow?.states ?? []).map(state => ({
      displayName: state.displayName,
      description: state.description ?? null,
    })),
    callouts: (previewSpace?.collaboration?.calloutsSet?.callouts ?? []).map(callout => ({
      id: callout.id,
      displayName: callout.framing.profile.displayName,
      description: callout.framing.profile.description ?? null,
      framingType: callout.framing.type,
      allowedContributionTypes: callout.settings?.contribution?.allowedTypes ?? [],
      flowStateDisplayName: callout.classification?.flowState?.tags?.[0] ?? null,
      sortOrder: callout.sortOrder ?? 0,
    })),
    subspaces: (previewSpace?.subspaces ?? []).map(subspace => ({
      id: subspace.id,
      displayName: subspace.about.profile.displayName,
    })),
  };

  useEffect(() => {
    if (!open) return;
    setErrors({});
  }, [open]);

  const onOpen = (args: { subspaceId: string; subspaceName: string }) => {
    setSubspaceName(args.subspaceName);
    setActiveSpaceId(args.subspaceId);
    // MUI initializes profile fields from the template's own profile, which is
    // empty for a brand-new template. Match that — the user types everything.
    setValues({ ...EMPTY });
    setErrors({});
    setUrlLoaderOpen(false);
    setUrl('');
    setUrlError(undefined);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onChange = (patch: Partial<SaveAsTemplateFormValues>) => {
    setValues(prev => ({ ...prev, ...patch }));
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof SaveAsTemplateFormValues)[]) {
        delete next[key];
      }
      return next;
    });
  };

  const isValid = values.displayName.trim().length >= 3 && !!activeSpaceId;

  const onSubmit = async () => {
    if (!templatesSetId || !activeSpaceId) return;
    const name = values.displayName.trim();
    if (name.length < 3) {
      setErrors({
        displayName: t('subspaces.saveAsTemplate.errors.nameTooShort', {
          defaultValue: 'Template name must be at least 3 characters',
        }),
      });
      return;
    }

    await createTemplateFromSpace({
      variables: {
        spaceId: activeSpaceId,
        templatesSetId,
        profileData: {
          displayName: name,
          description: values.description.trim() || undefined,
        },
        tags: values.tags,
        recursive: values.recursive,
      },
    });
    onClose();
    onSaved?.();
  };

  const onOpenUrlLoader = () => {
    setUrl('');
    setUrlError(undefined);
    setUrlLoaderOpen(true);
  };

  const onCloseUrlLoader = () => {
    setUrl('');
    setUrlError(undefined);
    setUrlLoaderOpen(false);
  };

  const onUrlChange = (next: string) => {
    setUrl(next);
    if (urlError) setUrlError(undefined);
  };

  const onUseUrl = async () => {
    setUrlError(undefined);
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError(
        t('subspaces.saveAsTemplate.urlLoader.errors.required', {
          defaultValue: 'Paste the URL of the space you want to copy as a template.',
        })
      );
      return;
    }
    setResolving(true);
    try {
      const { data, error } = await parseUrl({ variables: { url: trimmed } });
      if (error) {
        setUrlError(error.message);
        return;
      }
      if (data?.urlResolver.type !== UrlType.Space) {
        setUrlError(
          t('subspaces.saveAsTemplate.urlLoader.errors.invalidUrl', {
            defaultValue: 'This URL does not point to a space.',
          })
        );
        return;
      }
      const resolvedSpaceId = data.urlResolver.space?.id;
      if (!resolvedSpaceId) {
        setUrlError(t('subspaces.saveAsTemplate.urlLoader.errors.notFound', { defaultValue: 'Space not found.' }));
        return;
      }
      // Fetch the space's content to verify the user has Update privilege on
      // it — mirrors MUI's `refetchTemplateContent` + `checkSpaceUpdatePrivilege`.
      const { data: contentData, error: contentError } = await fetchSpaceContent({
        variables: { spaceId: resolvedSpaceId },
      });
      if (contentError) {
        setUrlError(contentError.message);
        return;
      }
      const privileges = contentData?.lookup.space?.authorization?.myPrivileges ?? [];
      if (!privileges.includes(AuthorizationPrivilege.Update)) {
        setUrlError(
          t('subspaces.saveAsTemplate.urlLoader.errors.noRights', {
            defaultValue: 'You need admin rights on the space you want to copy as a template.',
          })
        );
        return;
      }
      setActiveSpaceId(resolvedSpaceId);
      setUrlLoaderOpen(false);
      setUrl('');
    } finally {
      setResolving(false);
    }
  };

  const urlLoader: SaveAsTemplateUrlLoaderState = {
    open: urlLoaderOpen,
    url,
    error: urlError,
    resolving,
  };

  return {
    open,
    subspaceName,
    activeSpaceName,
    values,
    errors,
    submitting,
    canSubmit: isValid && !submitting,
    preview,
    previewLoading,
    urlLoader,
    onOpen,
    onClose,
    onChange,
    onSubmit,
    onOpenUrlLoader,
    onCloseUrlLoader,
    onUrlChange,
    onUseUrl,
  };
}

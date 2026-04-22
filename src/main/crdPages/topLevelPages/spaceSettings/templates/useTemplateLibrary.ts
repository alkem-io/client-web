import { useEffect, useState } from 'react';
import {
  useCreateTemplateFromContentSpaceMutation,
  useCreateTemplateMutation,
  useImportTemplateDialogAccountTemplatesQuery,
  useImportTemplateDialogPlatformTemplatesQuery,
  useImportTemplateDialogQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { TemplateCategory } from '@/crd/components/space/settings/SpaceSettingsTemplatesView';
import type { TemplateLibrarySection } from '@/crd/components/space/settings/TemplateLibraryDialog';
import {
  toCreateTemplateFromSpaceContentMutationVariables,
  toCreateTemplateMutationVariables,
} from '@/domain/templates/components/Forms/common/mappings';
import { categoryToTemplateType } from './templatesMapper';

export type UseTemplateLibraryResult = {
  open: boolean;
  category: TemplateCategory | null;
  templateType: TemplateType | null;
  templateTypeLabel: string | undefined;
  sections: TemplateLibrarySection[];
  canLoadPlatform: boolean;
  platformLoaded: boolean;
  onLoadPlatform: () => void;
  onSelect: (template: { id: string }) => Promise<void>;
  loadingSelect: boolean;
  openForCategory: (c: TemplateCategory) => void;
  close: () => void;
};

/**
 * Consumer-side hook for the CRD TemplateLibraryDialog. Mirrors the exact
 * MUI ImportTemplatesDialog behavior: reads space templates, account innovation
 * pack templates, and optionally platform templates, then commits the chosen
 * template via the same `createTemplate` / `createTemplateFromSpaceContent`
 * mutations the MUI admin uses.
 *
 * The caller owns the dialog trigger (each category's "Select from library"
 * action) and passes the category in — the hook computes the matching
 * TemplateType filter.
 */
export function useTemplateLibrary({
  templatesSetId,
  accountId,
}: {
  spaceId: string | undefined;
  templatesSetId: string | undefined;
  accountId: string | undefined;
}): UseTemplateLibraryResult {
  const [category, setCategory] = useState<TemplateCategory | null>(null);
  const [platformLoaded, setPlatformLoaded] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(false);

  const open = category !== null;
  const templateType = category ? categoryToTemplateType(category) : null;
  const skipAll = !open;

  const { data: spaceData, loading: spaceLoading } = useImportTemplateDialogQuery({
    fetchPolicy: 'network-only',
    variables: {
      templatesSetId: templatesSetId ?? '',
      includeCallout: templateType === TemplateType.Callout,
      includeSpace: templateType === TemplateType.Space,
    },
    skip: skipAll || !templatesSetId,
  });

  const { data: accountData, loading: accountLoading } = useImportTemplateDialogAccountTemplatesQuery({
    variables: {
      accountId: accountId ?? '',
      includeCallout: templateType === TemplateType.Callout,
      includeSpace: templateType === TemplateType.Space,
    },
    skip: skipAll || !accountId,
  });

  const { data: platformData, loading: platformLoading } = useImportTemplateDialogPlatformTemplatesQuery({
    variables: {
      templateTypes: templateType ? [templateType] : undefined,
      includeCallout: templateType === TemplateType.Callout,
      includeSpace: templateType === TemplateType.Space,
    },
    skip: skipAll || !platformLoaded,
  });

  // Auto-load platform when both space and account sections come back empty
  // (same fallback behavior as MUI's ImportTemplatesDialog).
  useEffect(() => {
    if (!open || platformLoaded) return;
    const spaceTemplates = spaceData?.lookup.templatesSet?.templates.filter(tmpl => tmpl.type === templateType) ?? [];
    const accountTemplates =
      accountData?.lookup.account?.innovationPacks.flatMap(
        pack => pack.templatesSet?.templates.filter(tmpl => tmpl.type === templateType) ?? []
      ) ?? [];
    const spaceReady = !!templatesSetId && !spaceLoading;
    const accountReady = !accountId || !accountLoading;
    if (spaceReady && accountReady && spaceTemplates.length === 0 && accountTemplates.length === 0) {
      setPlatformLoaded(true);
    }
  }, [
    open,
    platformLoaded,
    templatesSetId,
    accountId,
    spaceLoading,
    accountLoading,
    spaceData,
    accountData,
    templateType,
  ]);

  const [getTemplateContent] = useTemplateContentLazyQuery();
  const [createTemplate] = useCreateTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  const [createTemplateFromSpaceContent] = useCreateTemplateFromContentSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });

  const close = () => {
    setCategory(null);
    setPlatformLoaded(false);
  };

  const openForCategory = (c: TemplateCategory) => {
    setCategory(c);
    setPlatformLoaded(false);
  };

  const onSelect = async (template: { id: string }) => {
    if (!templateType || !templatesSetId) return;
    setLoadingSelect(true);
    try {
      const { data } = await getTemplateContent({
        variables: {
          templateId: template.id,
          includeCallout: templateType === TemplateType.Callout,
          includeCommunityGuidelines: templateType === TemplateType.CommunityGuidelines,
          includeSpace: templateType === TemplateType.Space,
          includePost: templateType === TemplateType.Post,
          includeWhiteboard: templateType === TemplateType.Whiteboard,
        },
      });
      const fetched = data?.lookup.template;
      if (!fetched) return;
      if (templateType === TemplateType.Space) {
        const variables = toCreateTemplateFromSpaceContentMutationVariables(templatesSetId, {
          ...fetched,
          contentSpaceId: fetched.contentSpace?.id ?? '',
        });
        await createTemplateFromSpaceContent({ variables });
      } else {
        const variables = toCreateTemplateMutationVariables(templatesSetId, templateType, fetched);
        await createTemplate({ variables });
      }
      close();
    } finally {
      setLoadingSelect(false);
    }
  };

  // ───── Build sections (filter by active templateType, enrich with provider labels) ─────
  const spaceSectionTemplates =
    spaceData?.lookup.templatesSet?.templates
      .filter(tmpl => tmpl.type === templateType)
      .map(tmpl => ({
        id: tmpl.id,
        name: tmpl.profile.displayName,
        description: tmpl.profile.description ?? '',
        thumbnailUrl: tmpl.profile.visual?.uri ?? null,
        providerName: null,
        providerAvatarUrl: null,
      })) ?? [];

  const accountSectionTemplates =
    accountData?.lookup.account?.innovationPacks.flatMap(pack =>
      (pack.templatesSet?.templates ?? [])
        .filter(tmpl => tmpl.type === templateType)
        .map(tmpl => ({
          id: tmpl.id,
          name: tmpl.profile.displayName,
          description: tmpl.profile.description ?? '',
          thumbnailUrl: tmpl.profile.visual?.uri ?? null,
          providerName: pack.profile.displayName ?? null,
          providerAvatarUrl: pack.provider?.profile?.avatar?.uri ?? null,
        }))
    ) ?? [];

  const platformSectionTemplates =
    platformData?.platform.library.templates.map(result => ({
      id: result.template.id,
      name: result.template.profile.displayName,
      description: result.template.profile.description ?? '',
      thumbnailUrl: result.template.profile.visual?.uri ?? null,
      providerName: result.innovationPack?.provider?.profile?.displayName ?? null,
      providerAvatarUrl: result.innovationPack?.provider?.profile?.avatar?.uri ?? null,
    })) ?? [];

  const sections: TemplateLibrarySection[] = [
    {
      key: 'space',
      heading: 'This space',
      templates: spaceSectionTemplates,
      loading: spaceLoading,
    },
    {
      key: 'account',
      heading: 'My innovation packs',
      templates: accountSectionTemplates,
      loading: accountLoading,
    },
  ];
  if (platformLoaded) {
    sections.push({
      key: 'platform',
      heading: 'Platform library',
      templates: platformSectionTemplates,
      loading: platformLoading,
    });
  }

  return {
    open,
    category,
    templateType,
    templateTypeLabel: category ? labelForCategory(category) : undefined,
    sections,
    canLoadPlatform: !!templatesSetId,
    platformLoaded,
    onLoadPlatform: () => setPlatformLoaded(true),
    onSelect,
    loadingSelect,
    openForCategory,
    close,
  };
}

function labelForCategory(c: TemplateCategory): string {
  switch (c) {
    case 'space':
      return 'Space';
    case 'collaborationTool':
      return 'Collaboration tool';
    case 'whiteboard':
      return 'Whiteboard';
    case 'post':
      return 'Post';
    case 'communityGuidelines':
      return 'Community guidelines';
  }
}

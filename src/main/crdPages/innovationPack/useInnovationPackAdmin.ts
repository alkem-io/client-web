import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminInnovationPackQuery,
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useUpdateInnovationPackMutation,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  InnovationPackFormErrors,
  InnovationPackFormProps,
  InnovationPackFormValues,
} from '@/crd/components/innovationPack/types';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { TemplateMarkdownUploadByIntent } from '@/main/crdPages/templates/useTemplateForms';
import { useTemplatesManager } from '@/main/crdPages/templates/useTemplatesManager';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  formValuesToUpdateInnovationPackInput,
  type InnovationPackBasics,
  type InnovationPackDetail,
  mapInnovationPackToBasics,
  mapInnovationPackToDetail,
} from './innovationPackMapper';

export type UseInnovationPackAdminResult = {
  loading: boolean;
  notFound: boolean;
  innovationPackId: string | undefined;
  pack: InnovationPackBasics | undefined;
  /** Pack details extended (form values, provider name, ids). `undefined` while loading. */
  detail: InnovationPackDetail | undefined;
  /** Holder-agnostic templates manager bound to this pack's templates set. */
  tm: ReturnType<typeof useTemplatesManager>;
  /** Pack edit form (controlled). Render via `<InnovationPackForm {...form} />`. */
  form: InnovationPackFormProps;
};

/**
 * Drives {@link CrdInnovationPackAdminPage}. Resolves the pack id from the route
 * (`<pack.profile.url>/settings`), loads the pack + its templates set, runs the
 * holder-agnostic {@link useTemplatesManager} for the templates surface, and now
 * (US7) owns the pack-details edit form lifecycle as well.
 *
 * The edit form sends a single save event; the hook fans it out across the
 * mutations the legacy code used:
 *  - `updateInnovationPack` for `listedInStore` / `searchVisibility` / `profileData`
 *    (displayName, description, tagset, **existing** references with an `ID`).
 *  - `createReferenceOnProfile` for each NEW reference (no `id`).
 *  - `deleteReference` for each removed reference.
 *  - `uploadVisual` for the queued avatar file (if any).
 *
 * Page access is the gate — no per-type authz. The legacy template deep-link
 * (`<pack.profile.url>/settings/<templateId>`) is preserved: in CRD it opens
 * that template's read-only Preview dialog (the legacy "pack deep-link →
 * straight to Edit" behaviour is intentionally dropped).
 */
export type UseInnovationPackAdminArgs = {
  /** Markdown image-upload wiring per intent for the templates manager. */
  templatesMarkdownUpload?: TemplateMarkdownUploadByIntent;
  /** Markdown image-upload wiring for the pack-details description editor (edit-only). */
  descriptionUpload?: MarkdownUploadProps;
};

export function useInnovationPackAdmin({
  templatesMarkdownUpload,
  descriptionUpload,
}: UseInnovationPackAdminArgs = {}): UseInnovationPackAdminResult {
  const { t } = useTranslation('crd-templates');
  const { innovationPackId, templateId, loading: resolvingUrl } = useUrlResolver();

  const {
    data,
    loading: loadingPack,
    refetch,
  } = useAdminInnovationPackQuery({
    variables: { innovationPackId: innovationPackId ?? '' },
    skip: !innovationPackId,
  });
  const gqlPack = data?.lookup.innovationPack;
  const pack = gqlPack ? mapInnovationPackToBasics(gqlPack) : undefined;
  const detail = gqlPack ? mapInnovationPackToDetail(gqlPack) : undefined;
  const templatesSetId = pack?.templatesSetId;

  const tm = useTemplatesManager({
    holderKind: 'innovationPack',
    templatesSetId,
    markdownUpload: templatesMarkdownUpload,
  });

  // Open the deep-linked template's Preview dialog once it (and the templates set) resolve.
  const [deepLinkedTemplateId, setDeepLinkedTemplateId] = useState<string | null>(null);
  useEffect(() => {
    if (!templateId || templateId === deepLinkedTemplateId || tm.loading || !templatesSetId) return;
    setDeepLinkedTemplateId(templateId);
    tm.onTemplateAction(templateId, 'preview');
  }, [templateId, deepLinkedTemplateId, templatesSetId, tm]);

  // ────────────────── Form state ──────────────────

  const [values, setValues] = useState<InnovationPackFormValues | null>(null);
  const valuesRef = useRef<InnovationPackFormValues | null>(null);
  const seededRef = useRef(false);
  const [submitting, startSubmitting] = useTransition();
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Seed once when the query first resolves. After that, the local buffer wins
  // (the user can edit freely; saves go straight to the mutations).
  useEffect(() => {
    if (detail && !seededRef.current) {
      seededRef.current = true;
      valuesRef.current = detail.formValues;
      setValues(detail.formValues);
    }
  }, [detail]);

  const [updateInnovationPack] = useUpdateInnovationPackMutation();
  const [uploadVisual] = useUploadVisualMutation();
  const [createReferenceOnProfile] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  const errors: InnovationPackFormErrors = (() => {
    if (!values) return {};
    const out: InnovationPackFormErrors = {};
    if (!values.name.trim()) out.name = t('packForm.nameRequired');
    values.references.forEach((r, i) => {
      if (!r.name.trim()) out[`references.${i}.name`] = t('references.nameRequired');
      if (!r.uri.trim()) out[`references.${i}.uri`] = t('references.uriRequired');
    });
    return out;
  })();

  const onChange = (next: InnovationPackFormValues) => {
    valuesRef.current = next;
    setValues(next);
  };

  const onSubmit = () => {
    const v = valuesRef.current;
    if (!v || !detail || Object.keys(errors).length > 0) return;
    setPendingSubmit(true);
    startSubmitting(() => {
      void (async () => {
        try {
          // 1. The pack update (profile basics + tags + existing refs + flags).
          await updateInnovationPack({
            variables: { packData: formValuesToUpdateInnovationPackInput(detail, v) },
          });

          // 2. New references — those without an `id`.
          const newRefs = v.references.filter(r => !r.id);
          for (const ref of newRefs) {
            await createReferenceOnProfile({
              variables: {
                input: {
                  profileID: detail.profileId,
                  name: ref.name,
                  uri: ref.uri,
                  description: ref.description ?? '',
                },
              },
            });
          }

          // 3. Removed references — those present in the seed but no longer in `v`.
          const seedRefs = detail.formValues.references;
          const remainingIds = new Set(v.references.map(r => r.id).filter(Boolean));
          const removed = seedRefs.filter(s => s.id && !remainingIds.has(s.id));
          for (const ref of removed) {
            await deleteReference({ variables: { input: { ID: ref.id ?? '' } } });
          }

          // 4. Queued avatar upload.
          if (v.avatarFile && detail.avatarVisualId) {
            await uploadVisual({
              variables: { file: v.avatarFile, uploadData: { visualID: detail.avatarVisualId } },
            });
          }

          // 5. Pull a fresh snapshot so the form re-seeds with the canonical server state.
          await refetch();
          seededRef.current = false;
        } finally {
          setPendingSubmit(false);
        }
      })();
    });
  };

  // The form always renders — when `values` is still null (initial load), feed an empty buffer.
  const formValues: InnovationPackFormValues = values ?? {
    name: '',
    description: '',
    tags: [],
    avatarFile: undefined,
    references: [],
    listedInStore: false,
    searchVisibility: 'account',
  };

  const form: InnovationPackFormProps = {
    value: formValues,
    errors,
    onChange,
    onSubmit,
    submitting: submitting || pendingSubmit,
    providerName: detail?.providerName ?? '',
    avatarUrl: detail ? undefined : undefined,
    // Pack admin only ever EDITS an existing pack → uploads go to the pack's
    // own bucket (temporaryLocation: false). Spread last so the three upload
    // props land on the form props object consumed by `<InnovationPackForm>`.
    ...descriptionUpload,
    // The canonical avatar URL comes from `pack.avatarUrl`; we read it off the basics
    // mapping (which already strips empty strings) so the form preview stays in sync
    // when the user uploads a new image and the query refetches.
  };
  if (pack?.avatarUrl) {
    form.avatarUrl = pack.avatarUrl;
  }

  const loading = resolvingUrl || (Boolean(innovationPackId) && loadingPack);
  const notFound = !loading && Boolean(innovationPackId) && !gqlPack;

  return { loading, notFound, innovationPackId, pack, detail, tm, form };
}

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateInnovationHubMutation, useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubSettingsFragment, UpdateInnovationHubInput } from '@/core/apollo/generated/graphql-schema';
import type { ImageCropConfig } from '@/crd/components/common/ImageCropDialog';
import { HUB_BANNER_ASPECT_RATIO } from '@/crd/components/innovationHub/InnovationHubBanner';
import type { HubAboutSectionKey, HubAboutSectionSaveStatus } from '../CrdInnovationHubSettingsPage.types';
import { type HubAboutFormValues, mapInnovationHubToAboutValues } from '../dataMappers/mapInnovationHubToAboutValues';
import {
  type HubAboutErrorKey,
  validateDescription,
  validateDisplayName,
  validateSubdomain,
  validateTagline,
  validateTags,
} from './hubAboutValidators';

const SAVED_FLASH_MS = 1800;

/**
 * In-flight banner crop. The user picked a file and the cropper is open;
 * `onBannerCropComplete` will fire the actual upload once they confirm.
 * Mirrors `PendingCrop` in `useAboutTabData` (Space Settings) — same pattern.
 */
export type PendingBannerCrop = {
  file: File;
  config: ImageCropConfig;
};

type HubAboutTabState = {
  values: HubAboutFormValues;
  dirty: Partial<Record<HubAboutSectionKey, boolean>>;
  saveStatus: Partial<Record<HubAboutSectionKey, HubAboutSectionSaveStatus>>;
  errors: Partial<Record<HubAboutSectionKey, string>>;
  onChange: (patch: Partial<HubAboutFormValues>) => void;
  onSaveSection: (key: HubAboutSectionKey) => void;
  /** Picks a file and opens the crop dialog. The upload does NOT fire until crop is confirmed. */
  onBannerFileSelected: (file: File) => void;
  /** Pending crop state — drives the `<ImageCropDialog>` open state at the page level. */
  pendingBannerCrop: PendingBannerCrop | null;
  /** Crop confirmed — uploads the (already-resized) file and applies alt text. */
  onBannerCropComplete: (data: { file: File; altText: string }) => void;
  /** Crop cancelled — clears `pendingBannerCrop` without uploading. */
  onBannerCropCancel: () => void;
  bannerUploading: boolean;
};

const validateSection = (key: HubAboutSectionKey, values: HubAboutFormValues): HubAboutErrorKey | undefined => {
  switch (key) {
    case 'subdomain':
      return validateSubdomain(values.subdomain);
    case 'name':
      return validateDisplayName(values.name);
    case 'tagline':
      return validateTagline(values.tagline);
    case 'description':
      return validateDescription(values.description);
    case 'tags':
      return validateTags(values.tags);
    case 'banner':
      return undefined;
  }
};

const buildSectionInput = (
  hub: InnovationHubSettingsFragment,
  key: HubAboutSectionKey,
  values: HubAboutFormValues
): UpdateInnovationHubInput | null => {
  const ID = hub.id;
  switch (key) {
    case 'subdomain':
      // Subdomain is immutable post-creation (server schema enforces it; the legacy
      // form also disables this field on edit). The About tab renders it read-only;
      // this branch should never fire.
      return null;
    case 'name':
      return { ID, profileData: { displayName: values.name.trim() } };
    case 'tagline':
      return { ID, profileData: { tagline: values.tagline } };
    case 'description':
      return { ID, profileData: { description: values.description } };
    case 'tags': {
      const tagset = hub.profile.tagset;
      if (!tagset) return null;
      return {
        ID,
        profileData: {
          tagsets: [{ ID: tagset.id, name: tagset.name, tags: values.tags }],
        },
      };
    }
    case 'banner':
      // Banner is handled via useUploadVisualMutation, not updateInnovationHub.
      return null;
  }
};

export const useHubAboutTabData = (hub: InnovationHubSettingsFragment | undefined): HubAboutTabState => {
  const { t } = useTranslation('crd-innovationHub');

  const saved: HubAboutFormValues | null = hub ? mapInnovationHubToAboutValues(hub) : null;

  const [values, setValues] = useState<HubAboutFormValues | null>(null);
  const valuesRef = useRef<HubAboutFormValues | null>(null);
  const initializedHubIdRef = useRef<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Partial<Record<HubAboutSectionKey, HubAboutSectionSaveStatus>>>({});
  const [errors, setErrors] = useState<Partial<Record<HubAboutSectionKey, string>>>({});
  const savedFlashTimers = useRef<Partial<Record<HubAboutSectionKey, ReturnType<typeof setTimeout>>>>({});
  const [, startTransition] = useTransition();

  const [updateInnovationHub] = useUpdateInnovationHubMutation();
  const [uploadVisual, { loading: bannerUploading }] = useUploadVisualMutation();

  const [pendingBannerCrop, setPendingBannerCrop] = useState<PendingBannerCrop | null>(null);

  // Seed local state when the query first resolves AND re-seed if the underlying
  // hub identity changes (e.g. the same component instance now points at a
  // different hub after a route change). Without the identity reset, the prior
  // hub's edits, errors, and pending crop would leak into the new one.
  useEffect(() => {
    if (!hub) return;
    if (initializedHubIdRef.current === hub.id) return;
    const next = mapInnovationHubToAboutValues(hub);
    initializedHubIdRef.current = hub.id;
    valuesRef.current = next;
    setValues(next);
    setSaveStatus({});
    setErrors({});
    setPendingBannerCrop(null);
    for (const timer of Object.values(savedFlashTimers.current)) {
      if (timer) clearTimeout(timer);
    }
    savedFlashTimers.current = {};
  }, [hub]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(savedFlashTimers.current)) {
        if (timer) clearTimeout(timer);
      }
    };
  }, []);

  const dirty: Partial<Record<HubAboutSectionKey, boolean>> = (() => {
    if (!values || !saved) return {};
    return {
      // subdomain is read-only — never dirty
      subdomain: false,
      name: values.name !== saved.name,
      tagline: values.tagline !== saved.tagline,
      description: values.description !== saved.description,
      tags: JSON.stringify(values.tags) !== JSON.stringify(saved.tags),
      banner: false,
    };
  })();

  const onChange = useCallback((patch: Partial<HubAboutFormValues>) => {
    setValues(prev => {
      const base = prev ?? valuesRef.current;
      if (!base) return prev;
      const next = { ...base, ...patch };
      valuesRef.current = next;
      return next;
    });
    // Clear any previous validation error for fields the user just edited.
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof HubAboutFormValues)[]) {
        if (key === 'subdomain' || key === 'name' || key === 'tagline' || key === 'description' || key === 'tags') {
          delete next[key];
        }
      }
      return next;
    });
  }, []);

  const onSaveSection = useCallback(
    (key: HubAboutSectionKey) => {
      const current = valuesRef.current;
      if (!hub || !current) return;

      const errorKey = validateSection(key, current);
      if (errorKey) {
        setErrors(prev => ({ ...prev, [key]: t(errorKey) }));
        return;
      }

      const input = buildSectionInput(hub, key, current);
      if (!input) return;

      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));

      void updateInnovationHub({ variables: { hubData: input } })
        .then(result => {
          if (result.data?.updateInnovationHub.id) {
            startTransition(() => {
              setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
              const previousTimer = savedFlashTimers.current[key];
              if (previousTimer) clearTimeout(previousTimer);
              savedFlashTimers.current[key] = setTimeout(() => {
                setSaveStatus(prev => ({ ...prev, [key]: 'idle' }));
              }, SAVED_FLASH_MS);
            });
          } else {
            setSaveStatus(prev => ({ ...prev, [key]: 'idle' }));
            setErrors(prev => ({ ...prev, [key]: t('settings.about.save.errorPrefix') }));
          }
        })
        .catch((err: Error) => {
          setSaveStatus(prev => ({ ...prev, [key]: 'idle' }));
          setErrors(prev => ({ ...prev, [key]: `${t('settings.about.save.errorPrefix')} ${err.message}` }));
        });
    },
    [hub, updateInnovationHub, t]
  );

  // ────────────────── Banner crop + upload ──────────────────

  const onBannerFileSelected = useCallback(
    (file: File) => {
      const visual = hub?.profile.visual;
      if (!visual?.id) {
        setErrors(prev => ({ ...prev, banner: t('settings.about.banner.errors.uploadFailed') }));
        return;
      }
      setErrors(prev => {
        const next = { ...prev };
        delete next.banner;
        return next;
      });
      // Open the cropper. The actual upload fires on `onBannerCropComplete`
      // — by then the file has been resized within the visual's bounds, so the
      // server stops rejecting oversized originals.
      //
      // `aspectRatio` is overridden with `HUB_BANNER_ASPECT_RATIO` (the same
      // ratio the page displays at) so the cropper preview WYSIWYG-matches
      // the rendered banner. The server's `visual.aspectRatio` for BANNER_WIDE
      // is intentionally ignored on display; the width/height bounds it
      // returns are still respected so uploads stay within accepted sizes.
      setPendingBannerCrop({
        file,
        config: {
          aspectRatio: HUB_BANNER_ASPECT_RATIO,
          maxWidth: visual.maxWidth ?? undefined,
          minWidth: visual.minWidth ?? undefined,
          maxHeight: visual.maxHeight ?? undefined,
          minHeight: visual.minHeight ?? undefined,
        },
      });
    },
    [hub, t]
  );

  const onBannerCropComplete = useCallback(
    ({ file, altText }: { file: File; altText: string }) => {
      setPendingBannerCrop(null);
      const visualId = hub?.profile.visual?.id;
      if (!visualId) return;
      void uploadVisual({
        variables: {
          file,
          uploadData: { visualID: visualId, alternativeText: altText || undefined },
        },
      })
        .then(result => {
          const uploaded = result.data?.uploadImageOnVisual;
          if (uploaded) {
            setValues(prev => {
              const base = prev ?? valuesRef.current;
              if (!base) return prev;
              const next: HubAboutFormValues = { ...base, bannerImageUrl: uploaded.uri };
              valuesRef.current = next;
              return next;
            });
          }
        })
        .catch((err: Error) => {
          setErrors(prev => ({
            ...prev,
            banner: `${t('settings.about.banner.errors.uploadFailed')} ${err.message}`,
          }));
        });
    },
    [hub, uploadVisual, t]
  );

  const onBannerCropCancel = useCallback(() => setPendingBannerCrop(null), []);

  return {
    values: values ??
      saved ?? {
        subdomain: '',
        name: '',
        tagline: '',
        description: '',
        tags: [],
        bannerImageUrl: undefined,
      },
    dirty,
    saveStatus,
    errors,
    onChange,
    onSaveSection,
    onBannerFileSelected,
    pendingBannerCrop,
    onBannerCropComplete,
    onBannerCropCancel,
    bannerUploading,
  };
};

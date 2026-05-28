import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateInnovationHubMutation, useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import type { InnovationHubSettingsFragment, UpdateInnovationHubInput } from '@/core/apollo/generated/graphql-schema';
import type { HubAboutSectionKey, HubAboutSectionSaveStatus } from '../CrdInnovationHubSettingsPage.types';
import { type HubAboutFormValues, mapInnovationHubToAboutValues } from '../dataMappers/mapInnovationHubToAboutValues';
import {
  validateDescription,
  validateDisplayName,
  validateSubdomain,
  validateTagline,
  validateTags,
} from './hubAboutValidators';

const SAVED_FLASH_MS = 1800;

type HubAboutTabState = {
  values: HubAboutFormValues;
  dirty: Partial<Record<HubAboutSectionKey, boolean>>;
  saveStatus: Partial<Record<HubAboutSectionKey, HubAboutSectionSaveStatus>>;
  errors: Partial<Record<HubAboutSectionKey, string>>;
  onChange: (patch: Partial<HubAboutFormValues>) => void;
  onSaveSection: (key: HubAboutSectionKey) => void;
  onBannerFileSelected: (file: File) => void;
  bannerUploading: boolean;
};

const validateSection = (key: HubAboutSectionKey, values: HubAboutFormValues): string | undefined => {
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
  const [saveStatus, setSaveStatus] = useState<Partial<Record<HubAboutSectionKey, HubAboutSectionSaveStatus>>>({});
  const [errors, setErrors] = useState<Partial<Record<HubAboutSectionKey, string>>>({});
  const savedFlashTimers = useRef<Partial<Record<HubAboutSectionKey, ReturnType<typeof setTimeout>>>>({});
  const [, startTransition] = useTransition();

  const [updateInnovationHub] = useUpdateInnovationHubMutation();
  const [uploadVisual, { loading: bannerUploading }] = useUploadVisualMutation();

  // Seed local state once the query first resolves. Subsequent cache updates
  // (via mutation results) are picked up via `saved` for dirty detection,
  // without overwriting user edits.
  useEffect(() => {
    if (saved && valuesRef.current === null) {
      valuesRef.current = saved;
      setValues(saved);
    }
  }, [saved]);

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
        // Validators return a fixed set of i18n keys from the `crd-innovationHub`
        // namespace; the dynamic key bypasses the typed-key overload via unknown.
        setErrors(prev => ({ ...prev, [key]: (t as (k: string) => string)(errorKey) }));
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

  const onBannerFileSelected = useCallback(
    (file: File) => {
      if (!hub?.profile.visual?.id) {
        setErrors(prev => ({ ...prev, banner: t('settings.about.banner.errors.uploadFailed') }));
        return;
      }
      setErrors(prev => {
        const next = { ...prev };
        delete next.banner;
        return next;
      });
      void uploadVisual({
        variables: {
          file,
          uploadData: { visualID: hub.profile.visual.id },
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
    bannerUploading,
  };
};

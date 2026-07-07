import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import useResolveHubResourceUrl, {
  type HubResourceType,
} from '@/domain/innovationHub/InnovationHubsSettings/useResolveHubResourceUrl';

type Status =
  | { kind: 'idle' }
  | { kind: 'validating' }
  | { kind: 'submitting' }
  | { kind: 'invalid' }
  | { kind: 'duplicate' }
  | { kind: 'submitError' };

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Literal-key records keep `t()` fully typed per resource type.
const URL_LABEL_KEYS = {
  space: 'settings.addResourceDialog.space.urlLabel',
  pack: 'settings.addResourceDialog.pack.urlLabel',
  virtualContributor: 'settings.addResourceDialog.virtualContributor.urlLabel',
} as const;

const URL_PLACEHOLDER_KEYS = {
  space: 'settings.addResourceDialog.space.urlPlaceholder',
  pack: 'settings.addResourceDialog.pack.urlPlaceholder',
  virtualContributor: 'settings.addResourceDialog.virtualContributor.urlPlaceholder',
} as const;

const INVALID_KEYS = {
  space: 'settings.addResourceDialog.space.invalid',
  pack: 'settings.addResourceDialog.pack.invalid',
  virtualContributor: 'settings.addResourceDialog.virtualContributor.invalid',
} as const;

const DUPLICATE_KEYS = {
  space: 'settings.addResourceDialog.space.duplicate',
  pack: 'settings.addResourceDialog.pack.duplicate',
  virtualContributor: 'settings.addResourceDialog.virtualContributor.duplicate',
} as const;

export type AddHubResourceByUrlFormProps = {
  resourceType: HubResourceType;
  /** ids already on the hub's curated list — a URL resolving to one of these reports "already added". */
  existingIds: string[];
  onAdd: (id: string) => Promise<void>;
  /** Called after a successful add so the host dialog can close. */
  onAdded: () => void;
};

/**
 * The add-by-URL tab body of the two-tab Add dialog — the former
 * `CrdAddSpaceByUrlDialog` form re-homed (same validation, duplicate, and
 * error behavior, FR-016) and generalised to all three resource types via
 * `useResolveHubResourceUrl` (FR-017/FR-019: any resource of the matching type
 * the admin can see, whichever account hosts it).
 */
export const AddHubResourceByUrlForm = ({
  resourceType,
  existingIds,
  onAdd,
  onAdded,
}: AddHubResourceByUrlFormProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const { resolve } = useResolveHubResourceUrl();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const requestIdRef = useRef(0);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    if (status.kind !== 'idle' && status.kind !== 'validating') {
      setStatus({ kind: 'idle' });
    }
  };

  const trimmedUrl = url.trim();
  const inFlight = status.kind === 'validating' || status.kind === 'submitting';
  const submitDisabled = trimmedUrl === '' || !isValidUrl(trimmedUrl) || inFlight;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitDisabled) return;
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    setStatus({ kind: 'validating' });
    const result = await resolve(trimmedUrl, resourceType);
    if (requestIdRef.current !== currentRequestId) return;
    if (result.kind === 'invalid') {
      setStatus({ kind: 'invalid' });
      return;
    }
    if (existingIds.includes(result.id)) {
      setStatus({ kind: 'duplicate' });
      return;
    }
    setStatus({ kind: 'submitting' });
    try {
      await onAdd(result.id);
      if (requestIdRef.current !== currentRequestId) return;
      setUrl('');
      setStatus({ kind: 'idle' });
      onAdded();
    } catch {
      if (requestIdRef.current !== currentRequestId) return;
      setStatus({ kind: 'submitError' });
    }
  };

  const errorMessage =
    status.kind === 'invalid'
      ? t(INVALID_KEYS[resourceType])
      : status.kind === 'duplicate'
        ? t(DUPLICATE_KEYS[resourceType])
        : status.kind === 'submitError'
          ? t('settings.addResourceDialog.url.submitError')
          : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="add-hub-resource-url-input">{t(URL_LABEL_KEYS[resourceType])}</Label>
        <Input
          id="add-hub-resource-url-input"
          type="url"
          value={url}
          onChange={handleUrlChange}
          disabled={inFlight}
          placeholder={t(URL_PLACEHOLDER_KEYS[resourceType])}
          aria-invalid={errorMessage ? 'true' : undefined}
          aria-describedby={errorMessage ? 'add-hub-resource-url-error' : undefined}
        />
        {errorMessage && (
          <p id="add-hub-resource-url-error" role="alert" aria-live="polite" className="text-caption text-destructive">
            {errorMessage}
          </p>
        )}
        {inFlight && (
          <p aria-live="polite" className="text-caption inline-flex items-center gap-1 text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-3 animate-spin" />
            {t(
              status.kind === 'submitting'
                ? 'settings.addResourceDialog.url.submitting'
                : 'settings.addResourceDialog.url.validating'
            )}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitDisabled}>
          {t('settings.addResourceDialog.url.submit')}
        </Button>
      </div>
    </form>
  );
};

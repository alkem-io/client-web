import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { KeyRound, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { McpApiKeyRowData, McpApiKeyStatusOption } from './McpApiKeys.types';

const NS = 'crd-contributorSettings';

const STATUS_BADGE_VARIANT: Record<McpApiKeyStatusOption, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  expired: 'secondary',
  revoked: 'destructive',
};

export type McpApiKeysCardProps = {
  loading: boolean;
  /** True when the key listing failed. Takes precedence over the empty state. */
  loadError?: boolean;
  /** Retry handler for a failed load; the retry button is hidden without it. */
  onRetry?: () => void;
  keys: McpApiKeyRowData[];
  revokingId: string | undefined;
  /** True when a mint just succeeded but the reveal panel was dismissed before the value was copied — offers revoke-and-recreate (spec edge case). */
  interruptedRevealKeyId: string | undefined;
  onCreate: () => void;
  /** `recreate` is true when triggered from the interrupted-reveal recovery,
   *  whose label promises a new key is created after revoking. */
  onRevoke: (key: McpApiKeyRowData, options?: { recreate?: boolean }) => void;
  /** Resolved by the consumer from the current UI language — CRD never reads i18n directly. */
  locale?: Locale;
};

/**
 * MCP API Keys card for the User Security tab (US2, FR-007, FR-008, FR-011,
 * FR-032, FR-033). Presentational — driven entirely by props. Renders
 * loading skeleton, an explanatory empty state, or the key list with a
 * revoke-only action (no delete control anywhere) and a status badge using
 * the REVOKED-over-EXPIRED precedence rule.
 */
export function McpApiKeysCard({
  loading,
  loadError,
  onRetry,
  keys,
  revokingId,
  interruptedRevealKeyId,
  onCreate,
  onRevoke,
  locale = enUS,
}: McpApiKeysCardProps) {
  const { t } = useTranslation(NS);
  // The recreate intent has to survive the confirmation dialog, so it is held
  // alongside the pending key rather than captured at click time.
  const [pendingRevoke, setPendingRevoke] = useState<{ key: McpApiKeyRowData; recreate: boolean } | undefined>(
    undefined
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // A failed load must NOT fall through to the empty state: telling a user who
  // holds live keys that they have none is worse than showing nothing, because
  // this card is the only surface that can revoke them.
  if (loadError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/10 py-10 text-center"
      >
        <KeyRound aria-hidden="true" className="size-8 text-muted-foreground/50" />
        <p className="text-body text-muted-foreground">{t('user.security.mcpApiKeys.errors.loadError')}</p>
        {onRetry && (
          <Button type="button" variant="outline" onClick={onRetry}>
            {t('user.security.mcpApiKeys.errors.retry')}
          </Button>
        )}
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/10 py-10 text-center">
        <KeyRound aria-hidden="true" className="size-8 text-muted-foreground/50" />
        <div>
          <p className="text-body-emphasis">{t('user.security.mcpApiKeys.empty.title')}</p>
          <p className="text-body text-muted-foreground">{t('user.security.mcpApiKeys.empty.description')}</p>
        </div>
        <Button type="button" onClick={onCreate}>
          <Plus aria-hidden="true" className="mr-2 size-4" />
          {t('user.security.mcpApiKeys.empty.create')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={onCreate}>
          <Plus aria-hidden="true" className="mr-2 size-4" />
          {t('user.security.mcpApiKeys.create.trigger')}
        </Button>
      </div>

      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" className="flex list-none flex-col gap-2 p-0 m-0">
        {keys.map(key => (
          <li key={key.id} className="rounded-md border p-4">
            <McpApiKeyRow
              apiKey={key}
              revoking={revokingId === key.id}
              interrupted={interruptedRevealKeyId === key.id}
              onRevoke={options => setPendingRevoke({ key, recreate: Boolean(options?.recreate) })}
              locale={locale}
            />
          </li>
        ))}
      </ul>

      <ConfirmationDialog
        open={Boolean(pendingRevoke)}
        onOpenChange={next => {
          if (!next) setPendingRevoke(undefined);
        }}
        title={t('user.security.mcpApiKeys.revoke.title')}
        description={t('user.security.mcpApiKeys.revoke.description', { name: pendingRevoke?.key.name ?? '' })}
        confirmLabel={
          revokingId === pendingRevoke?.key.id
            ? t('user.security.mcpApiKeys.revoke.revoking')
            : t('user.security.mcpApiKeys.revoke.confirm')
        }
        onConfirm={() => {
          if (pendingRevoke) onRevoke(pendingRevoke.key, { recreate: pendingRevoke.recreate });
          setPendingRevoke(undefined);
        }}
        variant="destructive"
        loading={revokingId === pendingRevoke?.key.id}
      />
    </div>
  );
}

function McpApiKeyRow({
  apiKey,
  revoking,
  interrupted,
  onRevoke,
  locale,
}: {
  apiKey: McpApiKeyRowData;
  revoking: boolean;
  interrupted: boolean;
  onRevoke: (options?: { recreate?: boolean }) => void;
  locale: Locale;
}) {
  const { t } = useTranslation(NS);
  const canRevoke = apiKey.status === 'active';

  return (
    <div className="flex flex-col gap-2">
      {/* Status sits with the operation badges — badge next to badge, matched
          in size and weight. The revoke Button (a fixed h-8 touch target) is
          pulled out of that cluster so a passive status chip is never lined up
          against an action control of a different height. */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-body-emphasis">{apiKey.name}</p>
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant={STATUS_BADGE_VARIANT[apiKey.status]}>
              {t(`user.security.mcpApiKeys.status.${apiKey.status}`)}
            </Badge>
            {apiKey.operations.map(operation => (
              <Badge key={operation} variant="outline">
                {t(`user.security.mcpApiKeys.operations.${operation}`)}
              </Badge>
            ))}
          </div>
        </div>
        {canRevoke ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            // ml-auto keeps the action right-aligned when the flex row wraps at
            // narrow widths; without it a wrapped button lands under the badge
            // cluster and reads as another chip rather than the row's action.
            className="ml-auto self-start"
            // Call with no argument — passing the handler directly would send
            // the MouseEvent into the `options` slot and read as truthy intent.
            onClick={() => onRevoke()}
            disabled={revoking}
            aria-busy={revoking}
          >
            {t('user.security.mcpApiKeys.list.revoke')}
          </Button>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-caption text-muted-foreground sm:grid-cols-4">
        <div>
          <dt className="sr-only">{t('user.security.mcpApiKeys.list.created')}</dt>
          <dd>{format(apiKey.createdDate, 'PP', { locale })}</dd>
        </div>
        <div>
          <dt className="sr-only">{t('user.security.mcpApiKeys.list.expires')}</dt>
          <dd>
            {apiKey.expiresAt
              ? format(apiKey.expiresAt, 'PP', { locale })
              : t('user.security.mcpApiKeys.list.neverExpires')}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t('user.security.mcpApiKeys.list.lastUsed')}</dt>
          <dd>
            {apiKey.lastUsedAt ? (
              <>
                {format(apiKey.lastUsedAt, 'PPp', { locale })}
                {apiKey.lastUsedFromIp
                  ? ` ${t('user.security.mcpApiKeys.list.lastUsedFrom', { address: apiKey.lastUsedFromIp })}`
                  : ''}
              </>
            ) : (
              t('user.security.mcpApiKeys.list.neverUsed')
            )}
          </dd>
        </div>
      </dl>

      {interrupted ? (
        <div className="mt-1 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-body-emphasis">{t('user.security.mcpApiKeys.interrupted.title')}</p>
          <p className="text-caption text-muted-foreground">{t('user.security.mcpApiKeys.interrupted.description')}</p>
          {canRevoke ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => onRevoke({ recreate: true })}
            >
              {t('user.security.mcpApiKeys.interrupted.revokeAndRecreate')}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

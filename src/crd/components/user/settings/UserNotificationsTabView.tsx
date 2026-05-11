import { Bell, Info, Mail, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type ChannelType = 'inApp' | 'email' | 'push';

export type NotificationRowData = {
  property: string;
  label: string;
  channels: { inApp: boolean; email: boolean; push: boolean };
};

export type NotificationGroupData = {
  groupId: string;
  title: string;
  description: string;
  rows: NotificationRowData[];
};

export type UserNotificationsTabViewProps = {
  loading: boolean;

  // Push master state — drives the master Switch card OR an info banner when
  // push isn't available in this browser/context.
  pushAvailable: boolean;
  pushSubscribed: boolean;
  pushLoading: boolean;
  pushPermissionDenied: boolean;
  pushRequiresPwa: boolean;
  onPushMasterToggle: () => void;

  // Activity groups (already privilege-filtered by the integration layer).
  groups: NotificationGroupData[];

  /** Called when any per-row Switch flips. Hook handles optimistic state + revert. */
  onToggle: (groupId: string, property: string, channel: ChannelType, next: boolean) => void;
};

/**
 * User Notifications tab — presentational view. Visual structure mirrors
 * `prototype/src/app/pages/UserNotificationsPage.tsx` plus a Push master
 * card on top (the prototype only models inApp + email; Alkemio adds push
 * which we surface only when available).
 *
 * Each group renders a `Card` with a header row showing column icons
 * (In-App / Email / [Push]) and one row per activity. The Push column is
 * hidden across all groups when push isn't available.
 */
export function UserNotificationsTabView(props: UserNotificationsTabViewProps) {
  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PushMasterBanner
        pushAvailable={props.pushAvailable}
        pushSubscribed={props.pushSubscribed}
        pushLoading={props.pushLoading}
        pushPermissionDenied={props.pushPermissionDenied}
        pushRequiresPwa={props.pushRequiresPwa}
        onPushMasterToggle={props.onPushMasterToggle}
      />

      <InfoBanner />

      {props.groups.map(group => (
        <NotificationGroupSection
          key={group.groupId}
          group={group}
          showPushColumn={props.pushAvailable}
          onToggle={props.onToggle}
        />
      ))}
    </div>
  );
}

// ─── Push master ─────────────────────────────────────────────────────────

function PushMasterBanner({
  pushAvailable,
  pushSubscribed,
  pushLoading,
  pushPermissionDenied,
  pushRequiresPwa,
  onPushMasterToggle,
}: {
  pushAvailable: boolean;
  pushSubscribed: boolean;
  pushLoading: boolean;
  pushPermissionDenied: boolean;
  pushRequiresPwa: boolean;
  onPushMasterToggle: () => void;
}) {
  const { t } = useTranslation(NS);

  if (pushRequiresPwa) {
    return (
      <Card className="border-warning/30 bg-warning/5 p-4">
        <div className="flex items-start gap-2 text-body text-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>{t('user.notifications.push.requiresPwa')}</p>
        </div>
      </Card>
    );
  }

  if (!pushAvailable) {
    return (
      <Card className="bg-muted/30 p-4">
        <div className="flex items-start gap-2 text-body text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{t('user.notifications.push.unavailable')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Smartphone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-body-emphasis">{t('user.notifications.push.masterToggle')}</p>
            <p className="text-caption text-muted-foreground">{t('user.notifications.push.masterToggleDescription')}</p>
            {pushPermissionDenied ? (
              <p className="mt-1 text-caption text-destructive">{t('user.notifications.push.permissionDenied')}</p>
            ) : null}
          </div>
        </div>
        <Switch
          checked={pushSubscribed}
          onCheckedChange={onPushMasterToggle}
          disabled={pushLoading}
          aria-label={t('user.notifications.push.masterToggle')}
        />
      </CardContent>
    </Card>
  );
}

function InfoBanner() {
  const { t } = useTranslation(NS);
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-body text-muted-foreground">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{t('user.notifications.helpBanner')}</p>
    </div>
  );
}

// ─── Group section ───────────────────────────────────────────────────────

function NotificationGroupSection({
  group,
  showPushColumn,
  onToggle,
}: {
  group: NotificationGroupData;
  showPushColumn: boolean;
  onToggle: (groupId: string, property: string, channel: ChannelType, next: boolean) => void;
}) {
  const { t } = useTranslation(NS);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-section-title">{group.title}</h2>
        <p className="text-body text-muted-foreground">{group.description}</p>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20 py-3">
          <div className="flex items-center justify-between gap-4">
            <span className="pl-1 text-label uppercase text-muted-foreground">
              {t('user.notifications.columns.activity')}
            </span>
            <div className="flex items-center gap-6 pr-2 md:gap-12">
              <ChannelHeader Icon={Bell} label={t('user.notifications.columns.inApp')} />
              <ChannelHeader Icon={Mail} label={t('user.notifications.columns.email')} />
              {showPushColumn ? <ChannelHeader Icon={Smartphone} label={t('user.notifications.columns.push')} /> : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {group.rows.map((row, idx) => (
            <div
              key={row.property}
              className={cn(
                'flex flex-col gap-4 p-4 transition-colors hover:bg-muted/10 md:flex-row md:items-center md:justify-between md:px-6',
                idx !== group.rows.length - 1 && 'border-b border-border/50'
              )}
            >
              <p className="flex-1 pr-4 text-body-emphasis leading-normal">{row.label}</p>
              <div className="flex items-center justify-end gap-6 md:gap-12">
                <ChannelSwitch
                  checked={row.channels.inApp}
                  onChange={next => onToggle(group.groupId, row.property, 'inApp', next)}
                  ariaLabel={t('user.notifications.toggleAria', {
                    channel: t('user.notifications.columns.inApp'),
                    label: row.label,
                  })}
                />
                <ChannelSwitch
                  checked={row.channels.email}
                  onChange={next => onToggle(group.groupId, row.property, 'email', next)}
                  ariaLabel={t('user.notifications.toggleAria', {
                    channel: t('user.notifications.columns.email'),
                    label: row.label,
                  })}
                />
                {showPushColumn ? (
                  <ChannelSwitch
                    checked={row.channels.push}
                    onChange={next => onToggle(group.groupId, row.property, 'push', next)}
                    ariaLabel={t('user.notifications.toggleAria', {
                      channel: t('user.notifications.columns.push'),
                      label: row.label,
                    })}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function ChannelHeader({ Icon, label }: { Icon: typeof Bell; label: string }) {
  return (
    <div className="flex w-12 flex-col items-center gap-1">
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <span className="text-badge uppercase font-bold text-muted-foreground">{label}</span>
    </div>
  );
}

function ChannelSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex w-12 justify-center">
      <Switch checked={checked} onCheckedChange={onChange} aria-label={ariaLabel} />
    </div>
  );
}

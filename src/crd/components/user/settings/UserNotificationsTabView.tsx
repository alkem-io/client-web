import { Bell, Info, Mail, Smartphone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection, type SettingsSectionIconColor } from '@/crd/components/common/SettingsSection';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type ChannelType = 'inApp' | 'email' | 'push';

export type NotificationRowData = {
  property: string;
  label: string;
  channels: { inApp: boolean; email: boolean; push: boolean };
  /**
   * When set, the in-app cell renders as a disabled OFF switch with this
   * caption instead of the normal interactive switch (affordance only —
   * enforcement is server-side).
   */
  inAppLockedCaption?: string;
};

export type NotificationGroupData = {
  groupId: string;
  title: string;
  description: string;
  /** Decorative icon for the section's coloured tile. */
  icon?: ReactNode;
  iconColor?: SettingsSectionIconColor;
  rows: NotificationRowData[];
};

/** The two independent sound preferences. A plain string-literal union so the
 * consumer's toggle handler is typed end-to-end and needs no cast. */
export type SoundSettingKey = 'chatMessage' | 'inAppNotification';

export type SoundRowData = {
  property: SoundSettingKey;
  label: string;
  enabled: boolean;
};

export type SoundGroupData = {
  groupId: string;
  title: string;
  description: string;
  /** Decorative icon for the section's coloured tile. */
  icon?: ReactNode;
  iconColor?: SettingsSectionIconColor;
  rows: SoundRowData[];
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

  /**
   * Running inside the native app shell. The OS owns permission there and there
   * is no browser subscription, so the master card states nothing and the
   * per-event push column stays reachable even though `pushAvailable` is false.
   */
  appMode: boolean;

  // Activity groups (already privilege-filtered by the integration layer).
  groups: NotificationGroupData[];

  /** The "Sounds" group — two independent on/off switches. */
  soundGroup: SoundGroupData;

  /** Called when any per-row Switch flips. Hook handles optimistic state + revert. */
  onToggle: (groupId: string, property: string, channel: ChannelType, next: boolean) => void;

  /** Called when a sound switch flips. Same optimistic state + revert handling. */
  onToggleSound: (property: SoundSettingKey, next: boolean) => void;
};

/**
 * User Notifications tab — presentational view (spec 097 Session 2026-10-23).
 * A Push master card on top (or the push-unavailable notice), the
 * "saved automatically" note, then one collapsible `SettingsSection` per
 * group — Sounds open, the rest collapsed. Activity groups show a column
 * header (In-App / Email / [Push]) and one row of switches per activity; the
 * Push column is hidden across all groups when push isn't available.
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
    <div className="space-y-6">
      <PushMasterBanner
        pushAvailable={props.pushAvailable}
        pushSubscribed={props.pushSubscribed}
        pushLoading={props.pushLoading}
        pushPermissionDenied={props.pushPermissionDenied}
        pushRequiresPwa={props.pushRequiresPwa}
        appMode={props.appMode}
        onPushMasterToggle={props.onPushMasterToggle}
      />

      <InfoBanner />

      <SoundGroupSection group={props.soundGroup} onToggle={props.onToggleSound} />

      {props.groups.map(group => (
        <NotificationGroupSection
          key={group.groupId}
          group={group}
          showPushColumn={props.pushAvailable || props.appMode}
          onToggle={props.onToggle}
        />
      ))}
    </div>
  );
}

// ─── Sounds group (single-switch rows) ───────────────────────────────────

function SoundGroupSection({
  group,
  onToggle,
}: {
  group: SoundGroupData;
  onToggle: (property: SoundSettingKey, next: boolean) => void;
}) {
  return (
    <SettingsSection title={group.title} description={group.description} icon={group.icon} iconColor={group.iconColor}>
      <ul className="divide-y divide-border/60 rounded-lg border">
        {group.rows.map(row => (
          <li key={row.property} className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="flex-1 text-body">{row.label}</p>
            <Switch
              checked={row.enabled}
              onCheckedChange={next => onToggle(row.property, next)}
              aria-label={row.label}
            />
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}

// ─── Push master ─────────────────────────────────────────────────────────

function PushMasterBanner({
  pushAvailable,
  pushSubscribed,
  pushLoading,
  pushPermissionDenied,
  pushRequiresPwa,
  appMode,
  onPushMasterToggle,
}: {
  pushAvailable: boolean;
  pushSubscribed: boolean;
  pushLoading: boolean;
  pushPermissionDenied: boolean;
  pushRequiresPwa: boolean;
  appMode: boolean;
  onPushMasterToggle: () => void;
}) {
  const { t } = useTranslation(NS);

  // This card is the *browser*-subscription switch. In the app there is no
  // browser subscription and the OS owns permission, so rendering nothing states
  // nothing rather than asserting something false. Surfacing the OS permission
  // state is deferred.
  if (appMode) {
    return null;
  }

  if (pushRequiresPwa) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-6 py-5 text-body text-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>{t('user.notifications.push.requiresPwa')}</p>
      </div>
    );
  }

  if (!pushAvailable) {
    return (
      <div className="flex items-start gap-3 rounded-lg border bg-card px-6 py-5 text-body text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>{t('user.notifications.push.unavailable')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        >
          <Smartphone className="size-4" />
        </span>
        <div>
          <p className="text-subsection-title">{t('user.notifications.push.masterToggle')}</p>
          <p className="text-body text-muted-foreground">{t('user.notifications.push.masterToggleDescription')}</p>
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
    </div>
  );
}

function InfoBanner() {
  const { t } = useTranslation(NS);
  return (
    <div className="flex items-center gap-2 px-1 text-caption text-muted-foreground">
      <Info aria-hidden="true" className="size-4 shrink-0" />
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
    <SettingsSection
      title={group.title}
      description={group.description}
      icon={group.icon}
      iconColor={group.iconColor}
      defaultOpen={false}
    >
      <div className="rounded-lg border">
        <div className="flex items-center justify-between gap-4 border-b bg-muted/20 px-4 py-2.5">
          <span className="text-label uppercase text-muted-foreground">{t('user.notifications.columns.activity')}</span>
          <div className="flex items-center gap-6 md:gap-12">
            <ChannelHeader Icon={Bell} label={t('user.notifications.columns.inApp')} />
            <ChannelHeader Icon={Mail} label={t('user.notifications.columns.email')} />
            {showPushColumn ? <ChannelHeader Icon={Smartphone} label={t('user.notifications.columns.push')} /> : null}
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {group.rows.map(row => {
            const inAppLocked = Boolean(row.inAppLockedCaption);
            const inAppCaptionId = `${group.groupId}-${row.property}-inapp-caption`;
            return (
              <div
                key={row.property}
                className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-muted/10 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1 pr-4">
                  <p className="text-body leading-normal">{row.label}</p>
                  {row.inAppLockedCaption ? (
                    <p id={inAppCaptionId} className="mt-1 text-caption text-muted-foreground">
                      {row.inAppLockedCaption}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center justify-end gap-6 md:gap-12">
                  <ChannelSwitch
                    checked={!inAppLocked && row.channels.inApp}
                    disabled={inAppLocked}
                    onChange={next => onToggle(group.groupId, row.property, 'inApp', next)}
                    ariaLabel={t('user.notifications.toggleAria', {
                      channel: t('user.notifications.columns.inApp'),
                      label: row.label,
                    })}
                    ariaDescribedBy={inAppLocked ? inAppCaptionId : undefined}
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
            );
          })}
        </div>
      </div>
    </SettingsSection>
  );
}

function ChannelHeader({ Icon, label }: { Icon: typeof Bell; label: string }) {
  return (
    <div className="flex w-12 flex-col items-center gap-1">
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <span className="text-label text-muted-foreground">{label}</span>
    </div>
  );
}

function ChannelSwitch({
  checked,
  onChange,
  ariaLabel,
  ariaDescribedBy,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-12 justify-center">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
      />
    </div>
  );
}

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformCapabilitiesQuery, useUserAssistantSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserAssistantTabView } from '@/crd/components/user/settings/UserAssistantTabView';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContentRaw, DialogOverlay, DialogTitle } from '@/crd/primitives/dialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import {
  isWhiteboardCapability,
  mapAssistantCapabilities,
  type PlatformCapability,
} from '@/main/crdPages/topLevelPages/userPages/settings/assistant/assistantCapabilitiesMapper';
import useUserAssistantTabData from '@/main/crdPages/topLevelPages/userPages/settings/assistant/useUserAssistantTabData';

/** Which slice of the capability grant the quick settings shows. */
export type AssistantSettingsScope = 'all' | 'whiteboard';

/**
 * Quick-access assistant settings, opened from the assistant panel header — the
 * per-capability grant of what the assistant may do on the user's behalf.
 *
 * Reuses the EXACT data layer + presentational view of the User → Settings →
 * Assistant tab (`CrdUserAssistantTab`), so the grant edited here is the same one
 * shown in settings (`platformCapabilities` enumerates the toggles;
 * `updateUserSettings({ assistant })` persists them).
 *
 * When opened from the in-whiteboard rail (`scope === 'whiteboard'`) only the
 * whiteboard-relevant capabilities are SHOWN; each toggle still persists the FULL
 * grant (the data hook keeps the complete capability list), so nothing else is lost.
 */
const AssistantSettingsContent = ({ scope }: { scope: AssistantSettingsScope }) => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;

  const { data: capabilitiesData, loading: capabilitiesLoading } = usePlatformCapabilitiesQuery({
    fetchPolicy: 'cache-and-network',
  });
  const { data: settingsData, loading: settingsLoading } = useUserAssistantSettingsQuery({
    variables: { userId: userId ?? '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const capabilities: PlatformCapability[] = capabilitiesData?.platformCapabilities ?? [];
  const storedToggles = settingsData?.user.settings.assistant.enabledCapabilities ?? [];

  // The data hook keeps the FULL capability list so each toggle persists the
  // complete grant (buildAssistantUpdatePayload sends every capability).
  const { overrides, onToggle } = useUserAssistantTabData({ userId, capabilities, storedToggles });
  const rows = mapAssistantCapabilities(capabilities, storedToggles, overrides);
  // Only the DISPLAYED rows are scoped — never the persisted set.
  const displayRows = scope === 'whiteboard' ? rows.filter(row => isWhiteboardCapability(row.name)) : rows;

  const handleToggle = async (capabilityName: string, next: boolean) => {
    try {
      await onToggle(capabilityName, next);
    } catch {
      notify(t('user.assistant.toggleError'), 'error');
    }
  };

  const loading = (capabilitiesLoading && !capabilitiesData) || (settingsLoading && !settingsData);

  return <UserAssistantTabView loading={loading} capabilities={displayRows} onToggle={handleToggle} />;
};

const AssistantSettingsDialog = ({
  open,
  onClose,
  scope = 'all',
}: {
  open: boolean;
  onClose: () => void;
  scope?: AssistantSettingsScope;
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      {/* Render IN PLACE (no DialogPortal) so the dialog stays inside the same
          focus containers as its host: the panel's FocusScope and, in a
          whiteboard, the whiteboard editor's Radix modal. A portaled dialog
          escapes those containers, so the whiteboard's focus trap reclaims the
          keyboard and the toggles can't be operated. */}
      <DialogOverlay />
      <DialogContentRaw
        aria-labelledby="assistant-settings-title"
        className="bg-background fixed top-[50%] left-[50%] z-50 flex max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-border p-2">
          <div>
            <DialogTitle id="assistant-settings-title" className="text-section-title">
              {t('assistant.settings')}
            </DialogTitle>
            {scope === 'whiteboard' && (
              <span className="text-caption text-muted-foreground">{t('assistant.settingsWhiteboardScope')}</span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('assistant.closeButton')}>
            <X aria-hidden={true} />
          </Button>
        </div>
        <div className="overflow-y-auto p-4">{open ? <AssistantSettingsContent scope={scope} /> : null}</div>
      </DialogContentRaw>
    </Dialog>
  );
};

export default AssistantSettingsDialog;

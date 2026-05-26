import { useState } from 'react';
import { DesignVersionUpgradeDialog } from '@/crd/components/common/DesignVersionUpgradeDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { DESIGN_VERSION_OLD } from './useCrdEnabled';
import { useDesignVersionToggle } from './useDesignVersionToggle';

const UPGRADE_PROMPT_DISMISSED_KEY = 'alkemio-design-version-upgrade-dismissed';

function readDismissedFromStorage(): boolean {
  try {
    return localStorage.getItem(UPGRADE_PROMPT_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissedToStorage(): void {
  try {
    localStorage.setItem(UPGRADE_PROMPT_DISMISSED_KEY, '1');
  } catch {
    // Private-mode browsers may block localStorage — non-fatal.
  }
}

export function DesignVersionUpgradePromptMount() {
  const { isAuthenticated, loadingMe, designVersion } = useCurrentUserContext();
  const toggle = useDesignVersionToggle();
  const [isDismissed, setIsDismissed] = useState(() => readDismissedFromStorage());

  if (!isAuthenticated || loadingMe || designVersion !== DESIGN_VERSION_OLD || isDismissed) {
    return null;
  }
  if (!toggle.isVisible) {
    return null;
  }

  const handleDismiss = () => {
    writeDismissedToStorage();
    setIsDismissed(true);
  };

  const handleConfirm = () => {
    writeDismissedToStorage();
    setIsDismissed(true);
    void toggle.onChange(true);
  };

  return (
    <DesignVersionUpgradeDialog
      open={true}
      isPending={toggle.isPending}
      onConfirm={handleConfirm}
      onDismiss={handleDismiss}
    />
  );
}

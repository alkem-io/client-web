import { CrdSpaceAbout } from '../about/CrdSpaceAbout';

type CrdSpaceAboutDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Sidebar "About this Space" trigger.
 *
 * Thin wrapper around the shared `CrdSpaceAbout` so the dialog opened from
 * the sidebar is functionally identical to the `/about` route — same apply
 * flow, guidelines block, host-contact line, and edit affordances.
 */
export function CrdSpaceAboutDialogConnector({ open, onOpenChange }: CrdSpaceAboutDialogConnectorProps) {
  return <CrdSpaceAbout open={open} onClose={() => onOpenChange(false)} />;
}

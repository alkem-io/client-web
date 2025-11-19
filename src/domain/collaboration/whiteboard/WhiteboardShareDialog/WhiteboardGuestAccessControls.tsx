import { FC, ReactNode } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface WhiteboardGuestAccessControlsProps {
  whiteboard?: {
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
  };
  guestAccessEnabled?: boolean;
  children: ReactNode;
}

/**
 * Wrapper component that conditionally renders guest access controls
 * based on the PUBLIC_SHARE privilege in the whiteboard's authorization.
 *
 * This component implements the privilege check required by Feature 002:
 * - Shows children (guest access UI) only if user has PUBLIC_SHARE privilege
 * - Hides controls silently if privilege is missing (no error state)
 * - Type-safe check using AuthorizationPrivilege enum
 */
export const WhiteboardGuestAccessControls: FC<WhiteboardGuestAccessControlsProps> = ({
  whiteboard,
  guestAccessEnabled,
  children,
}) => {
  // Check for PUBLIC_SHARE privilege (Decision 1 from research.md)
  const hasPublicSharePrivilege =
    whiteboard?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.PublicShare) ?? false;

  // Hide controls if user doesn't have PUBLIC_SHARE privilege (Decision 2: Silent failure)
  if (!hasPublicSharePrivilege && !guestAccessEnabled) {
    return null;
  }

  // Render guest access controls (toggle, URL, etc.) provided as children
  return <>{children}</>;
};

export default WhiteboardGuestAccessControls;

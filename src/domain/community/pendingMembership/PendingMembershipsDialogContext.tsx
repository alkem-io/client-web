import React, { createContext, useContext, useState } from 'react';

export enum PendingMembershipsDialogType {
  PendingMembershipsList,
  InvitationView,
}

export interface DialogDetails {
  type: PendingMembershipsDialogType;
}

export interface PendingMembershipsListDialogDetails extends DialogDetails {
  type: PendingMembershipsDialogType.PendingMembershipsList;
  spaceUri?: string;
}

export interface InvitationViewDialogDetails extends DialogDetails {
  type: PendingMembershipsDialogType.InvitationView;
  invitationId: string;
  spaceUri?: string;
}

interface PendingMembershipsContextValue {
  openDialog: PendingMembershipsListDialogDetails | InvitationViewDialogDetails | undefined;
  setOpenDialog: React.Dispatch<
    React.SetStateAction<PendingMembershipsListDialogDetails | InvitationViewDialogDetails | undefined>
  >;
}

const PendingMembershipsDialogContext = createContext<PendingMembershipsContextValue | undefined>(undefined);

export const usePendingMembershipsDialog = () => {
  const context = useContext(PendingMembershipsDialogContext);
  if (!context) {
    throw new Error('usePendingMembershipsDialog must be inside a PendingMembershipsDialogProvider');
  }
  return context;
};

export const PendingMembershipsDialogProvider = ({ children }) => {
  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  return (
    <PendingMembershipsDialogContext value={{ openDialog, setOpenDialog }}>{children}</PendingMembershipsDialogContext>
  );
};

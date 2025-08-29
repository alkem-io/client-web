// TODO: These are events defined in a xstate machine.
// Maybe we should expose them from the server or just use other type of enums, but for now:

export enum InvitationState {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum InvitationEvent {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  ARCHIVE = 'ARCHIVE',
}

export enum ApplicationState {
  NEW = 'new',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum ApplicationEvent {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ARCHIVE = 'ARCHIVE',
}

import type { ReactNode } from 'react';

export enum NotificationValidationType {
  LOCKED = 'locked',
  REQUIRE_AT_LEAST_ONE = 'require-at-least-one',
  EMAIL_LOCKED = 'email-locked',
}

export interface NotificationValidationRule {
  type: NotificationValidationType;
  message: string;
}

export type ChannelType = 'inApp' | 'email' | 'push';

export interface NotificationOption {
  inAppChecked: boolean;
  emailChecked: boolean;
  pushChecked: boolean;
  label: ReactNode;

  // Validation rules
  validationRules?: NotificationValidationRule[];
}

export interface SwitchState {
  disabled: boolean;
  tooltipMessage?: string;
}

export interface NotificationSwitchStates {
  inApp: SwitchState;
  email: SwitchState;
  push: SwitchState;
}

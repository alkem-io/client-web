import {
  type ChannelType,
  type NotificationOption,
  type NotificationSwitchStates,
  type NotificationValidationRule,
  NotificationValidationType,
} from '../types/NotificationTypes';

export class NotificationValidationService {
  /**
   * Calculates the state (disabled/enabled + tooltip) for all three switches based on validation rules
   */
  static calculateSwitchStates(
    option: NotificationOption,
    options?: { isPushEnabled?: boolean; isPushAvailable?: boolean }
  ): NotificationSwitchStates {
    const rules = option.validationRules || [];

    return {
      inApp: NotificationValidationService.calculateSwitchState(option, 'inApp', rules),
      email: NotificationValidationService.calculateSwitchState(option, 'email', rules),
      push: NotificationValidationService.calculatePushSwitchState(option, rules, options),
    };
  }

  /**
   * Calculates the state for a specific switch (inApp or email)
   */
  private static calculateSwitchState(
    option: NotificationOption,
    switchType: 'inApp' | 'email',
    rules: NotificationValidationRule[]
  ): { disabled: boolean; tooltipMessage?: string } {
    // Check for locked notification rule
    const lockedRule = rules.find(rule => rule.type === NotificationValidationType.LOCKED);
    if (lockedRule) {
      return {
        disabled: true,
        tooltipMessage: lockedRule.message,
      };
    }

    // Check for email-locked rule
    if (switchType === 'email') {
      const emailLockedRule = rules.find(rule => rule.type === NotificationValidationType.EMAIL_LOCKED);
      if (emailLockedRule) {
        return {
          disabled: true,
          tooltipMessage: emailLockedRule.message,
        };
      }
    }

    // Check for require-at-least-one rule (considers all three channels)
    const requireAtLeastOneRule = rules.find(rule => rule.type === NotificationValidationType.REQUIRE_AT_LEAST_ONE);
    if (requireAtLeastOneRule) {
      const enabledCount =
        (option.inAppChecked ? 1 : 0) + (option.emailChecked ? 1 : 0) + (option.pushChecked ? 1 : 0);

      const isThisChecked = switchType === 'inApp' ? option.inAppChecked : option.emailChecked;

      if (isThisChecked && enabledCount <= 1) {
        return {
          disabled: true,
          tooltipMessage: requireAtLeastOneRule.message,
        };
      }
    }

    return { disabled: false };
  }

  /**
   * Calculates the state for the push switch
   */
  private static calculatePushSwitchState(
    option: NotificationOption,
    rules: NotificationValidationRule[],
    options?: { isPushEnabled?: boolean; isPushAvailable?: boolean }
  ): { disabled: boolean; tooltipMessage?: string } {
    // Push is disabled when not available or master toggle is off
    if (options?.isPushAvailable === false || options?.isPushEnabled === false) {
      return { disabled: true };
    }

    // Check for locked notification rule
    const lockedRule = rules.find(rule => rule.type === NotificationValidationType.LOCKED);
    if (lockedRule) {
      return {
        disabled: true,
        tooltipMessage: lockedRule.message,
      };
    }

    // Check for require-at-least-one rule (considers all three channels)
    const requireAtLeastOneRule = rules.find(rule => rule.type === NotificationValidationType.REQUIRE_AT_LEAST_ONE);
    if (requireAtLeastOneRule) {
      const enabledCount =
        (option.inAppChecked ? 1 : 0) + (option.emailChecked ? 1 : 0) + (option.pushChecked ? 1 : 0);

      if (option.pushChecked && enabledCount <= 1) {
        return {
          disabled: true,
          tooltipMessage: requireAtLeastOneRule.message,
        };
      }
    }

    return { disabled: false };
  }

  /**
   * Validates if a change is allowed before sending to server
   */
  static isChangeAllowed(option: NotificationOption, switchType: ChannelType, newValue: boolean): boolean {
    const rules = option.validationRules || [];

    // Disallow any change when fully LOCKED
    if (rules.some(r => r.type === NotificationValidationType.LOCKED)) {
      return false;
    }

    // Disallow email changes when EMAIL_LOCKED
    if (switchType === 'email' && rules.some(r => r.type === NotificationValidationType.EMAIL_LOCKED)) {
      return false;
    }

    // If trying to disable and require-at-least-one rule exists
    if (!newValue) {
      const requireAtLeastOneRule = rules.find(rule => rule.type === NotificationValidationType.REQUIRE_AT_LEAST_ONE);
      if (requireAtLeastOneRule) {
        const enabledCount =
          (option.inAppChecked ? 1 : 0) + (option.emailChecked ? 1 : 0) + (option.pushChecked ? 1 : 0);

        const isThisChecked =
          switchType === 'inApp'
            ? option.inAppChecked
            : switchType === 'email'
              ? option.emailChecked
              : option.pushChecked;

        if (isThisChecked && enabledCount <= 1) {
          return false;
        }
      }
    }

    return true;
  }
}

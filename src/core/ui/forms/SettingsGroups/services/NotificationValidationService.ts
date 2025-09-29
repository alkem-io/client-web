import {
  NotificationOption,
  NotificationSwitchStates,
  NotificationValidationRule,
  NotificationValidationType,
} from '../types/NotificationTypes';

export class NotificationValidationService {
  /**
   * Calculates the state (disabled/enabled + tooltip) for both switches based on validation rules
   */
  static calculateSwitchStates(option: NotificationOption): NotificationSwitchStates {
    const rules = option.validationRules || [];

    return {
      inApp: this.calculateSwitchState(option, 'inApp', rules),
      email: this.calculateSwitchState(option, 'email', rules),
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

    // Check for require-at-least-one rule
    const requireAtLeastOneRule = rules.find(rule => rule.type === NotificationValidationType.REQUIRE_AT_LEAST_ONE);
    if (requireAtLeastOneRule) {
      const isThisTheOnlyEnabledSwitch =
        switchType === 'inApp'
          ? option.inAppChecked && !option.emailChecked
          : option.emailChecked && !option.inAppChecked;

      if (isThisTheOnlyEnabledSwitch) {
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
  static isChangeAllowed(option: NotificationOption, switchType: 'inApp' | 'email', newValue: boolean): boolean {
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
        const wouldBeTheLastEnabled =
          switchType === 'inApp'
            ? option.inAppChecked && !option.emailChecked
            : option.emailChecked && !option.inAppChecked;

        if (wouldBeTheLastEnabled) {
          return false;
        }
      }
    }

    return true;
  }
}

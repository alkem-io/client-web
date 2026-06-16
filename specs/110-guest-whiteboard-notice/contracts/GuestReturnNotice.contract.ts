/**
 * Contract: GuestReturnNotice (CRD presentational component)
 * Location (impl): src/crd/components/auth/GuestReturnNotice.tsx
 *
 * Purpose: the "You've left your whiteboard" card shown above the SignUpCard on
 * the CRD sign-up route when an active guest whiteboard session is detected.
 *
 * CRD constraints (enforced in review):
 *  - NO @mui/* or @emotion/* imports.
 *  - NO business logic: no @/core/apollo, @/domain/*, @/core/auth/*, react-router-dom.
 *  - All behaviour arrives via on* callback props; the component never navigates.
 *  - Strings come from useTranslation('crd-auth') — none are passed as text props
 *    (this is design-system copy, not business data). The only inputs are the
 *    two action callbacks.
 *  - Styling: Tailwind + cn() only; icons from lucide-react (ArrowLeft, ArrowRight).
 *  - Typography uses semantic tokens (text-hero/text-section-title, text-body, text-caption…).
 *  - WCAG 2.1 AA: real <button> controls, accessible names, visible focus-visible ring.
 */

export type GuestReturnNoticeProps = {
  /**
   * Invoked when the guest activates "Back to whiteboard".
   * The consumer navigates to the stored whiteboard URL. MUST NOT clear the
   * guest session (the identity must survive the round-trip — FR-006).
   */
  onBackToWhiteboard: () => void;

  /**
   * Invoked when the guest activates "Go to our website".
   * The consumer sends the user to Alkemio's public site. MUST NOT clear the
   * guest session (FR-006).
   */
  onGoToWebsite: () => void;

  /** Optional className passthrough for layout composition by the consumer. */
  className?: string;
};

/**
 * i18n contract — keys added under the `guestReturn` group of the `crd-auth`
 * namespace (src/crd/i18n/auth/auth.<lang>.json), present in all six languages
 * with key parity (en, nl, es, bg, de, fr):
 *
 *   guestReturn.title                 — e.g. "You've left your whiteboard"
 *   guestReturn.description           — guest session still active + return/explore
 *   guestReturn.backButton            — e.g. "Back to whiteboard"
 *   guestReturn.websiteButton         — e.g. "Go to our website"
 *   guestReturn.contributeTitle       — e.g. "Want to contribute more?"
 *   guestReturn.contributeDescription — invite to create an account (direction-neutral)
 */
export type GuestReturnNoticeI18nKeys =
  | 'guestReturn.title'
  | 'guestReturn.description'
  | 'guestReturn.backButton'
  | 'guestReturn.websiteButton'
  | 'guestReturn.contributeTitle'
  | 'guestReturn.contributeDescription';

/**
 * Integration contract — CrdSignUpPage (src/main/crdPages/auth/SignUpCrdRoute.tsx):
 *
 *   const { shouldShowNotification, handleBackToWhiteboard, handleGoToWebsite } =
 *     useGuestSessionReturn();
 *
 *   <AuthShellWrapper>
 *     <div className="flex flex-col gap-6">
 *       {shouldShowNotification && (
 *         <GuestReturnNotice
 *           onBackToWhiteboard={handleBackToWhiteboard}
 *           onGoToWebsite={handleGoToWebsite}
 *         />
 *       )}
 *       <SignUpCard … />
 *     </div>
 *   </AuthShellWrapper>
 *
 * Notes:
 *  - `useGuestSessionReturn` is the existing domain hook; it owns the session read
 *    and the navigation side effects. The page passes its handlers straight through.
 *  - When shouldShowNotification is false, the rendered output is identical to today
 *    (FR-008) — the wrapping div with a single child collapses visually (gap has no
 *    effect with one child).
 */

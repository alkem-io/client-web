import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';

export type AuthCardHeaderProps = {
  /** Text shown above the cross-link, e.g. "No account?", "Have an account?". */
  contextLabel: string;
  /** Text of the cross-link itself, e.g. "Sign up", "Sign in". */
  contextLinkLabel: string;
  /** `href` the cross-link navigates to. */
  contextLinkHref: string;
};

export function AuthCardHeader({ contextLabel, contextLinkLabel, contextLinkHref }: AuthCardHeaderProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <AlkemioLogo aria-hidden="true" className="size-7 shrink-0" />
          <span className="text-section-title font-bold uppercase text-foreground">Alkemio</span>
        </div>
        <p className="mt-1.5 text-caption text-muted-foreground">{t('tagline')}</p>
      </div>
      <div className="text-right">
        <span className="text-body text-muted-foreground">{contextLabel}</span>
        <br />
        <a
          href={contextLinkHref}
          className="text-body-emphasis font-semibold text-foreground outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm"
        >
          {contextLinkLabel}
        </a>
      </div>
    </div>
  );
}

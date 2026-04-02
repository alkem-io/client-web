import { Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import type { CrdFooterLinks, CrdLanguageOption } from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

type FooterProps = {
  links?: CrdFooterLinks;
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onSupportClick?: () => void;
  className?: string;
};

const linkClassName = 'hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

export function Footer({
  links,
  languages,
  currentLanguage,
  onLanguageChange,
  onSupportClick,
  className,
}: FooterProps) {
  const { t } = useTranslation('crd-layout');

  const currentLabel = languages.find(l => currentLanguage.startsWith(l.code))?.label ?? 'English';

  return (
    <footer className={cn('py-8 px-4 sm:px-6 mt-auto border-t border-border bg-card', className)}>
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Copyright */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('footer.copyright')}</span>
        </div>

        {/* Links + centered logo */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6 text-sm text-muted-foreground"
        >
          {links?.terms && (
            <a href={links.terms} className={linkClassName}>
              {t('footer.terms')}
            </a>
          )}
          {links?.privacy && (
            <a href={links.privacy} className={linkClassName}>
              {t('footer.privacy')}
            </a>
          )}
          {links?.security && (
            <a href={links.security} className={linkClassName}>
              {t('footer.security')}
            </a>
          )}

          <AlkemioLogo aria-hidden="true" className="w-5 h-5 opacity-40 hidden sm:block" />

          {onSupportClick ? (
            <button
              type="button"
              onClick={onSupportClick}
              className={cn(
                linkClassName,
                'cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit text-sm'
              )}
            >
              {t('footer.support')}
            </button>
          ) : null}
          {links?.about && (
            <a href={links.about} className={linkClassName}>
              {t('footer.about')}
            </a>
          )}
        </nav>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent transition-colors text-sm text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Globe aria-hidden="true" className="w-3.5 h-3.5" />
              <span>{currentLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {languages.map(lang => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={cn(
                  'flex items-center justify-between cursor-pointer',
                  currentLanguage.startsWith(lang.code) && 'bg-accent'
                )}
              >
                <span className="text-sm">{lang.label}</span>
                {currentLanguage.startsWith(lang.code) && (
                  <Check aria-hidden="true" className="w-4 h-4 shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </footer>
  );
}

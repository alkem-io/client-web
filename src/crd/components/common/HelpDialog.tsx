import { FileQuestion, MessagesSquare, Sparkles } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
  /** App version string (e.g. "0.149.0"), without the leading "v". */
  version: string;
  /** Server version string (e.g. "0.149.4"), without the leading "v". */
  serverVersion: string;
  docsHref: string;
  supportHref?: string;
  welcomeSpaceHref: string;
  className?: string;
};

function HelpDialog({
  open,
  onClose,
  version,
  serverVersion,
  docsHref,
  supportHref,
  welcomeSpaceHref,
  className,
}: HelpDialogProps) {
  const { t } = useTranslation('crd-help');

  const links = [
    { href: docsHref, label: t('icons.exploreDocumentation'), Icon: FileQuestion },
    { href: supportHref, label: t('icons.contactTheTeam'), Icon: MessagesSquare },
    { href: welcomeSpaceHref, label: t('icons.joinTheWelcomeSpace'), Icon: Sparkles },
  ];

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className={cn('sm:max-w-2xl', className)} closeLabel={t('close')}>
        <DialogHeader>
          <DialogTitle className="text-page-title">{t('title')}</DialogTitle>
        </DialogHeader>

        <p className="text-body text-foreground">{t('text')}</p>

        <ul className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3">
          {links.map(({ href, label, Icon }) => (
            <li key={label} className="flex">
              <a
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={label}
                className="flex w-full flex-col items-center gap-3 rounded-lg p-4 text-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-10 text-primary" aria-hidden="true" />
                <span className="text-subheader font-bold text-primary">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:gap-6">
          <p className="text-caption text-foreground">
            <Trans ns="crd-help" i18nKey="versionNumber" values={{ version }} components={{ b: <strong /> }} />
          </p>
          <p className="text-caption text-foreground">
            <Trans
              ns="crd-help"
              i18nKey="serverVersionNumber"
              values={{ version: serverVersion }}
              components={{ b: <strong /> }}
            />
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { HelpDialog };
export type { HelpDialogProps };

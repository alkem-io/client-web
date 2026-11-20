import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formBoxBodyClass } from '@/crd/components/callout/formStyles';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

type CalloutFormBoxProps = {
  /** The Form's own title; the generic "Form" label is shown when it is empty. */
  title?: string;
  /** The Form's own plain-text description. */
  description?: string;
  questionCount: number;
  /** Closed or not published: shown as a badge in the header. */
  status?: 'CLOSED' | 'DRAFT';
  /** The initial state of the body; each mounted box then keeps its own state. */
  defaultCollapsed: boolean;
  /** The review entry point, for viewers who may read every response. */
  onViewResponses?: () => void;
  responseCount?: number;
  /** The collapsible part: the fill-in, the viewer's own responses, the state messages. */
  children: ReactNode;
  className?: string;
};

/**
 * The bordered box that makes a Form recognisable inside a Post: a header that stays the same in every state
 * (icon, title, question count, description, state badge, review entry point and the
 * expand/collapse chevron) above a collapsible body.
 */
export function CalloutFormBox({
  title,
  description,
  questionCount,
  status,
  defaultCollapsed,
  onViewResponses,
  responseCount = 0,
  children,
  className,
}: CalloutFormBoxProps) {
  const { t } = useTranslation('crd-space');
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const instanceId = useId();
  const bodyId = `form-box-body-${instanceId}`;
  const headingId = `form-box-heading-${instanceId}`;
  const heading = title?.trim() || t('formFillIn.untitled');

  return (
    <section aria-labelledby={headingId} className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      <div className={cn('space-y-3 p-4 sm:p-6', !collapsed && 'border-b')}>
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          >
            <ClipboardList className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 id={headingId} className="text-subsection-title break-words text-foreground">
              {heading}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-caption text-muted-foreground">
                {t('formFillIn.questionCount', { count: questionCount })}
              </span>
              {status && (
                <Badge variant="secondary">
                  {status === 'DRAFT' ? t('formFillIn.draftBadge') : t('formFillIn.closedBadge')}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            aria-expanded={!collapsed}
            aria-controls={bodyId}
            aria-label={collapsed ? t('formFillIn.expand') : t('formFillIn.collapse')}
            onClick={() => setCollapsed(value => !value)}
          >
            {collapsed ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {onViewResponses && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onViewResponses}>
              {t('formResponses.viewAction', { count: responseCount })}
            </Button>
          </div>
        )}

        {description?.trim() && (
          <p className="text-body whitespace-pre-line break-words text-foreground">{description}</p>
        )}
      </div>

      <div id={bodyId} hidden={collapsed} className={formBoxBodyClass}>
        {children}
      </div>
    </section>
  );
}

import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Calendar } from '@/crd/primitives/calendar';
import { Checkbox } from '@/crd/primitives/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import type { McpApiKeyOperationOption } from './McpApiKeys.types';

const NS = 'crd-contributorSettings';

const OPERATION_OPTIONS: McpApiKeyOperationOption[] = ['read', 'tools'];

export type McpApiKeyCreateInput = {
  name: string;
  operations: McpApiKeyOperationOption[];
  expiresAt: Date | undefined;
};

export type McpApiKeyCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  /** Server-rendered error (cap reached, validation) shown inline on the form. */
  serverError?: string;
  onCreate: (input: McpApiKeyCreateInput) => void;
  /** Resolved by the consumer from the current UI language — CRD never reads i18n directly. */
  locale?: Locale;
};

/**
 * Create-key dialog for the MCP API Keys card (US1, FR-025). Presentational —
 * takes an `onCreate` callback and renders whatever server error is passed in.
 * Client-side refusals (no operation selected, past expiry) never call the
 * mutation (US1-AS6, FR-029).
 */
export function McpApiKeyCreateDialog({
  open,
  onOpenChange,
  submitting,
  serverError,
  onCreate,
  locale = enUS,
}: McpApiKeyCreateDialogProps) {
  const { t } = useTranslation(NS);
  const nameId = useId();
  const [name, setName] = useState('');
  const [operations, setOperations] = useState<McpApiKeyOperationOption[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const resetForm = () => {
    setName('');
    setOperations([]);
    setExpiresAt(undefined);
    setLocalError(undefined);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const toggleOperation = (operation: McpApiKeyOperationOption, checked: boolean) => {
    setOperations(prev => (checked ? [...prev, operation] : prev.filter(op => op !== operation)));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError(undefined);

    if (operations.length === 0) {
      setLocalError(t('user.security.mcpApiKeys.create.operationsRequired'));
      return;
    }
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      setLocalError(t('user.security.mcpApiKeys.create.expiryPastError'));
      return;
    }

    onCreate({ name: name.trim(), operations, expiresAt });
  };

  const errorMessage = localError ?? serverError;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('user.security.mcpApiKeys.create.title')}</DialogTitle>
            <DialogDescription>{t('user.security.mcpApiKeys.create.description')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={nameId}>{t('user.security.mcpApiKeys.create.nameLabel')}</Label>
              <Input
                id={nameId}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('user.security.mcpApiKeys.create.namePlaceholder')}
                maxLength={128}
                required={true}
              />
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-body-emphasis">{t('user.security.mcpApiKeys.create.operationsLabel')}</legend>
              {OPERATION_OPTIONS.map(operation => {
                const optionId = `${nameId}-op-${operation}`;
                return (
                  <div key={operation} className="flex items-center gap-2">
                    <Checkbox
                      id={optionId}
                      checked={operations.includes(operation)}
                      onCheckedChange={checked => toggleOperation(operation, checked === true)}
                    />
                    <Label htmlFor={optionId} className="font-normal">
                      {t(`user.security.mcpApiKeys.operations.${operation}`)}
                    </Label>
                  </div>
                );
              })}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <Label>{t('user.security.mcpApiKeys.create.expiryLabel')}</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild={true}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-label={t('user.security.mcpApiKeys.create.expiryLabel')}
                  >
                    <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
                    {expiresAt
                      ? format(expiresAt, 'PPP', { locale })
                      : t('user.security.mcpApiKeys.create.expiryPlaceholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={next => {
                      setExpiresAt(next);
                      setCalendarOpen(false);
                    }}
                    disabled={[{ before: new Date() }]}
                    locale={locale}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {errorMessage ? (
              <p role="alert" className="text-caption text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              {t('user.security.mcpApiKeys.create.cancel')}
            </Button>
            <Button type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting
                ? t('user.security.mcpApiKeys.create.submitting')
                : t('user.security.mcpApiKeys.create.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

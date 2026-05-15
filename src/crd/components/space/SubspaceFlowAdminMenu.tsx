import { Layout, Replace } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

export type SubspaceFlowAdminMenuState = {
  id: string;
  label: string;
};

export type SubspaceFlowAdminMenuProps = {
  states: SubspaceFlowAdminMenuState[];
  currentStateId: string | undefined;
  /** Called with the state id when the admin sets a new current state. */
  onSetCurrentState: (stateId: string) => void;
  /** Called when the admin chooses "Replace innovation flow". */
  onReplaceFlowClick: () => void;
  /** Link to the flow layout editor (settings/layout). Renders as menu item when provided. */
  editLayoutHref?: string;
};

export function SubspaceFlowAdminMenu({
  states,
  currentStateId,
  onSetCurrentState,
  onReplaceFlowClick,
  editLayoutHref,
}: SubspaceFlowAdminMenuProps) {
  const { t } = useTranslation('crd-subspace');
  const triggerLabel = t('flowAdmin.trigger');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label={triggerLabel}
        >
          <Layout className="w-4 h-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[14rem]">
        {states.length > 0 && (
          <>
            <DropdownMenuLabel>{t('flowAdmin.setCurrentState')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentStateId ?? ''}
              onValueChange={value => {
                if (value && value !== currentStateId) onSetCurrentState(value);
              }}
            >
              {states.map(state => (
                <DropdownMenuRadioItem key={state.id} value={state.id}>
                  <span className="truncate">{state.label}</span>
                  {state.id === currentStateId && (
                    <span className="ml-2 text-xs text-muted-foreground">{t('flowAdmin.currentStateMarker')}</span>
                  )}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={onReplaceFlowClick}>
          <Replace className="w-4 h-4 mr-2 text-muted-foreground" aria-hidden="true" />
          {t('flowAdmin.replaceFlow')}
        </DropdownMenuItem>
        {editLayoutHref && (
          <DropdownMenuItem asChild={true}>
            <a href={editLayoutHref} className="flex items-center">
              <Layout className="w-4 h-4 mr-2 text-muted-foreground" aria-hidden="true" />
              {t('flowAdmin.editLayout')}
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TemplateFormDialog } from '@/crd/components/templates/TemplateFormDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderDialog = (isDirty: boolean) => {
  const onCancel = vi.fn();
  render(
    <TemplateFormDialog
      open={true}
      intent="edit"
      type="whiteboard"
      commonValue={{ name: 'Template', description: 'Description', tags: [] }}
      commonErrors={{}}
      onCommonChange={vi.fn()}
      perTypeFormSlot={<div>Live body</div>}
      submitting={false}
      onSubmit={vi.fn()}
      onCancel={onCancel}
      isDirty={isDirty}
    />
  );
  return { onCancel };
};

describe('TemplateFormDialog edit actions', () => {
  it('offers Done when the live child changed independently and metadata is pristine', () => {
    const { onCancel } = renderDialog(false);

    expect(screen.getByRole('button', { name: 'form.save' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'form.done' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('keeps Cancel and Save when outer metadata is dirty', () => {
    renderDialog(true);

    expect(screen.getByRole('button', { name: 'form.cancel' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'form.save' })).toBeEnabled();
  });
});

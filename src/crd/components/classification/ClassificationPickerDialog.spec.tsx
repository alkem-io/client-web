/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { ClassificationPickerDialog } from './ClassificationPickerDialog';
import type { ClassificationTemplateOptionData } from './types';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-spaceSettings');
});

const sdgs: ClassificationTemplateOptionData = {
  id: 'tpl-sdgs',
  displayLabel: 'SDGs',
  description: 'UN Sustainable Development Goals',
  cardinality: 'MULTI_SELECT',
  values: [],
};
const sector: ClassificationTemplateOptionData = {
  id: 'tpl-sector',
  displayLabel: 'Sector',
  description: 'Primary industry sector',
  cardinality: 'SINGLE_SELECT',
  values: [],
};

describe('ClassificationPickerDialog', () => {
  it('shows platform-wide and Space-scoped groups visually distinguished, each with its description, and no create affordance (US1-AS1, C-5, FR-015, FR-016)', () => {
    render(
      <ClassificationPickerDialog
        open={true}
        onOpenChange={vi.fn()}
        sources={[
          { key: 'platform', templates: [sdgs] },
          { key: 'space', templates: [sector] },
        ]}
        onSelectTemplate={vi.fn()}
        onRetryWithLabel={vi.fn()}
        onDismissConflict={vi.fn()}
      />
    );

    expect(screen.getByText('Platform-wide')).toBeInTheDocument();
    expect(screen.getByText("This Space's library")).toBeInTheDocument();
    expect(screen.getByText('SDGs')).toBeInTheDocument();
    expect(screen.getByText('UN Sustainable Development Goals')).toBeInTheDocument();
    expect(screen.getByText('Sector')).toBeInTheDocument();
    expect(screen.getByText('Primary industry sector')).toBeInTheDocument();

    // No "create a template" / ad-hoc "create a classification" affordance anywhere in the dialog.
    expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
  });

  it('picking a template fires onSelectTemplate with its id (Step A commits immediately)', async () => {
    const onSelectTemplate = vi.fn();
    render(
      <ClassificationPickerDialog
        open={true}
        onOpenChange={vi.fn()}
        sources={[{ key: 'platform', templates: [sdgs] }]}
        onSelectTemplate={onSelectTemplate}
        onRetryWithLabel={vi.fn()}
        onDismissConflict={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /SDGs/ }));
    expect(onSelectTemplate).toHaveBeenCalledWith('tpl-sdgs');
  });

  it('surfaces a server-side display-label conflict as a prompt for a different label, never a "you already added this template" message (FR-011a, US1-AS6)', () => {
    render(
      <ClassificationPickerDialog
        open={true}
        onOpenChange={vi.fn()}
        sources={[{ key: 'platform', templates: [sdgs] }]}
        onSelectTemplate={vi.fn()}
        conflict={{ templateId: 'tpl-sdgs', attemptedLabel: 'SDGs' }}
        onRetryWithLabel={vi.fn()}
        onDismissConflict={vi.fn()}
      />
    );
    expect(screen.queryByText(/already added this template/i)).not.toBeInTheDocument();
    expect(screen.getByText(/already in use/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Display label')).toBeInTheDocument();
  });

  it('retrying the conflict with a new label fires onRetryWithLabel(templateId, label)', async () => {
    const onRetryWithLabel = vi.fn();
    render(
      <ClassificationPickerDialog
        open={true}
        onOpenChange={vi.fn()}
        sources={[{ key: 'platform', templates: [sdgs] }]}
        onSelectTemplate={vi.fn()}
        conflict={{ templateId: 'tpl-sdgs', attemptedLabel: 'SDGs' }}
        onRetryWithLabel={onRetryWithLabel}
        onDismissConflict={vi.fn()}
      />
    );
    const input = screen.getByLabelText('Display label');
    await userEvent.clear(input);
    await userEvent.type(input, 'SDGs — aspirational');
    await userEvent.click(screen.getByRole('button', { name: 'Add with this label' }));
    expect(onRetryWithLabel).toHaveBeenCalledWith('tpl-sdgs', 'SDGs — aspirational');
  });

  it('shows the no-templates guidance and never a create affordance when neither source has any (Edge Case: no templates available)', () => {
    render(
      <ClassificationPickerDialog
        open={true}
        onOpenChange={vi.fn()}
        sources={[
          { key: 'platform', templates: [] },
          { key: 'space', templates: [] },
        ]}
        onSelectTemplate={vi.fn()}
        onRetryWithLabel={vi.fn()}
        onDismissConflict={vi.fn()}
      />
    );
    expect(screen.getByText('No Classification Templates yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
  });
});

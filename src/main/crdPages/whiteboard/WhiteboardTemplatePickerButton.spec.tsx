import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  selectedTemplateId: null as string | null,
  selectedTemplateContent: null as { type: 'whiteboard'; sourceWhiteboardId: string } | null,
  clearSelection: vi.fn(),
  onImport: vi.fn(async () => {}),
  // The space's templates set: not served yet (undefined) unless a test serves it.
  spaceTemplatesSetId: undefined as string | undefined,
  // The space the button sits in (undefined: outside a space, e.g. the public whiteboard route).
  levelZeroSpaceId: undefined as string | undefined,
  openPicker: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceTemplatesManagerQuery: () => ({ data: undefined }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { accountId: undefined, levelZeroSpaceId: h.levelZeroSpaceId } }),
}));
vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  servedSpaceTemplatesSetId: () => h.spaceTemplatesSetId,
  useTemplatePicker: () => ({
    selectedTemplateId: h.selectedTemplateId,
    selectedTemplateContent: h.selectedTemplateContent,
    clearSelection: h.clearSelection,
    openPicker: h.openPicker,
    pickerProps: {},
  }),
}));
vi.mock('@/crd/components/templates/TemplatePicker', () => ({ TemplatePicker: () => null }));
vi.mock('@/crd/primitives/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));
vi.mock('@/crd/primitives/skeleton', () => ({ Skeleton: () => null }));

import { WhiteboardTemplatePickerButton } from './WhiteboardTemplatePickerButton';

describe('WhiteboardTemplatePickerButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.selectedTemplateId = null;
    h.selectedTemplateContent = null;
    h.spaceTemplatesSetId = 'templates-set';
    h.levelZeroSpaceId = 'space';
  });

  it('consumes each selection independently, including selecting the same template twice', async () => {
    const view = render(<WhiteboardTemplatePickerButton onImport={h.onImport} />);

    h.selectedTemplateId = 'template-1';
    h.selectedTemplateContent = { type: 'whiteboard', sourceWhiteboardId: 'source-whiteboard' };
    view.rerender(<WhiteboardTemplatePickerButton onImport={h.onImport} />);
    await waitFor(() => expect(h.onImport).toHaveBeenCalledTimes(1));
    expect(h.clearSelection).toHaveBeenCalledTimes(1);

    await act(async () => {});
    h.selectedTemplateId = null;
    h.selectedTemplateContent = null;
    view.rerender(<WhiteboardTemplatePickerButton onImport={h.onImport} />);

    h.selectedTemplateId = 'template-1';
    h.selectedTemplateContent = { type: 'whiteboard', sourceWhiteboardId: 'source-whiteboard' };
    view.rerender(<WhiteboardTemplatePickerButton onImport={h.onImport} />);

    await waitFor(() => expect(h.onImport).toHaveBeenCalledTimes(2));
    expect(h.clearSelection).toHaveBeenCalledTimes(2);
  });

  it('with the space templates served the button opens the picker', () => {
    render(<WhiteboardTemplatePickerButton onImport={h.onImport} />);
    fireEvent.click(screen.getByRole('button', { name: 'buttons.find-template' }));
    expect(h.openPicker).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('tabs.unavailable')).not.toBeInTheDocument();
  });

  it('outside a space the picker opens as legacy, with its other sources', () => {
    h.spaceTemplatesSetId = undefined;
    h.levelZeroSpaceId = undefined;
    render(<WhiteboardTemplatePickerButton onImport={h.onImport} />);
    fireEvent.click(screen.getByRole('button', { name: 'buttons.find-template' }));
    expect(h.openPicker).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('tabs.unavailable')).not.toBeInTheDocument();
  });

  it('in a space whose templates are not served yet the button says so in a dialog instead of the picker', () => {
    h.spaceTemplatesSetId = undefined;
    render(<WhiteboardTemplatePickerButton onImport={h.onImport} />);
    fireEvent.click(screen.getByRole('button', { name: 'buttons.find-template' }));
    expect(screen.getByText('tabs.unavailable')).toBeInTheDocument();
    expect(h.openPicker).not.toHaveBeenCalled();
  });
});

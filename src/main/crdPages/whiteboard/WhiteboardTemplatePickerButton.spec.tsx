import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  selectedTemplateId: null as string | null,
  selectedTemplateContent: null as { type: 'whiteboard'; sourceWhiteboardId: string } | null,
  clearSelection: vi.fn(),
  onImport: vi.fn(async () => {}),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceTemplatesManagerQuery: () => ({ data: undefined }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { accountId: undefined, levelZeroSpaceId: undefined } }),
}));
vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  useTemplatePicker: () => ({
    selectedTemplateId: h.selectedTemplateId,
    selectedTemplateContent: h.selectedTemplateContent,
    clearSelection: h.clearSelection,
    openPicker: vi.fn(),
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
});

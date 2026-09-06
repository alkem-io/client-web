/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useWhiteboardDetailsByIdQuery: ({ variables, skip }: { variables: { whiteboardId: string }; skip: boolean }) => ({
    data: skip
      ? undefined
      : {
          lookup: {
            whiteboard: {
              id: variables.whiteboardId,
              profile: { displayName: 'Template drawing', url: '/whiteboard/template' },
              authorization: { myPrivileges: [] },
            },
          },
        },
    loading: false,
  }),
}));

vi.mock('@/main/crdPages/whiteboard/CrdWhiteboardView', () => ({
  default: ({ whiteboardId }: { whiteboardId: string }) => <div data-testid="live-whiteboard">{whiteboardId}</div>,
}));

import { WhiteboardTemplateFormConnector } from './WhiteboardTemplateFormConnector';

const value = {
  type: 'whiteboard' as const,
  name: 'Template drawing',
  description: 'Reusable diagram',
  tags: [],
};

describe('WhiteboardTemplateFormConnector', () => {
  it('materializes a new template Whiteboard before opening its live editor', async () => {
    const materialize = vi.fn().mockResolvedValue(true);

    function Harness() {
      const [whiteboardId, setWhiteboardId] = useState<string>();
      return (
        <WhiteboardTemplateFormConnector
          value={value}
          editableWhiteboardId={whiteboardId}
          onMaterialize={async () => {
            const created = await materialize();
            if (created) setWhiteboardId('template-whiteboard-1');
            return created;
          }}
        />
      );
    }

    render(<Harness />);

    const startDrawing = screen.getByRole('button', { name: 'form.whiteboard.startDrawing' });
    expect(startDrawing).toBeEnabled();
    fireEvent.click(startDrawing);

    await waitFor(() => expect(materialize).toHaveBeenCalledOnce());
    expect(await screen.findByTestId('live-whiteboard')).toHaveTextContent('template-whiteboard-1');
  });

  it('opens an existing template Whiteboard without materializing another one', async () => {
    const materialize = vi.fn();
    render(
      <WhiteboardTemplateFormConnector
        value={value}
        editableWhiteboardId="template-whiteboard-2"
        onMaterialize={materialize}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'form.whiteboard.editDrawing' }));

    expect(await screen.findByTestId('live-whiteboard')).toHaveTextContent('template-whiteboard-2');
    expect(materialize).not.toHaveBeenCalled();
  });
});

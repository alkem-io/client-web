/** @vitest-environment jsdom */
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  applyDraft: vi.fn(),
  allowedTypes: [] as string[],
  selectedTemplateContent: undefined as
    | { type: 'post'; defaultDescription: string }
    | { type: 'whiteboard'; sourceWhiteboardId: string }
    | undefined,
  selectedTemplateId: undefined as string | undefined,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceTemplatesManagerQuery: () => ({ data: undefined }),
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { accountId: 'account-1' } }),
}));

vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  useTemplatePicker: ({ allowedTypes }: { allowedTypes: string[] }) => {
    harness.allowedTypes = allowedTypes;
    return {
      selectedTemplateContent: harness.selectedTemplateContent,
      selectedTemplateId: harness.selectedTemplateId,
      openPicker: vi.fn(),
      pickerProps: {},
    };
  },
}));

vi.mock('@/crd/components/templates/TemplatePicker', () => ({
  TemplatePicker: () => null,
}));

vi.mock('@/crd/forms/callout/ResponseDefaultsDialog', () => ({
  ResponseDefaultsDialog: ({
    templateSlot,
  }: {
    templateSlot?: (args: { applyDraft: typeof harness.applyDraft }) => unknown;
  }) => templateSlot?.({ applyDraft: harness.applyDraft }) ?? null,
}));

import { ResponseDefaultsConnector } from './ResponseDefaultsConnector';

const values = {
  defaultDisplayName: '',
  postDescription: '',
  whiteboardContentAvailable: false,
};

describe('ResponseDefaultsConnector template boundaries', () => {
  beforeEach(() => {
    harness.applyDraft.mockReset();
    harness.allowedTypes = [];
    harness.selectedTemplateContent = undefined;
    harness.selectedTemplateId = undefined;
  });

  it('keeps memo defaults on the Markdown/post-template path', async () => {
    harness.selectedTemplateContent = { type: 'post', defaultDescription: 'memo template body' };
    harness.selectedTemplateId = 'post-template-1';

    render(
      <ResponseDefaultsConnector open={true} onOpenChange={vi.fn()} type="memo" values={values} onSave={vi.fn()} />
    );

    expect(harness.allowedTypes).toEqual(['post']);
    await waitFor(() => expect(harness.applyDraft).toHaveBeenCalledWith({ postDescription: 'memo template body' }));
  });

  it('applies a whiteboard template by source id without snapshot bytes', async () => {
    harness.selectedTemplateContent = { type: 'whiteboard', sourceWhiteboardId: 'whiteboard-source-1' };
    harness.selectedTemplateId = 'whiteboard-template-1';

    render(
      <ResponseDefaultsConnector
        open={true}
        onOpenChange={vi.fn()}
        type="whiteboard"
        values={values}
        onSave={vi.fn()}
      />
    );

    expect(harness.allowedTypes).toEqual(['whiteboard']);
    await waitFor(() =>
      expect(harness.applyDraft).toHaveBeenCalledWith({
        sourceWhiteboardId: 'whiteboard-source-1',
        sourceCalloutId: undefined,
        whiteboardContentAvailable: true,
        clearWhiteboardContent: false,
      })
    );
    const appliedDraft = harness.applyDraft.mock.calls[0]?.[0];
    expect(appliedDraft).toHaveProperty('sourceCalloutId', undefined);
    expect(appliedDraft).not.toHaveProperty('whiteboardContent');
  });
});

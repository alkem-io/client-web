/** @vitest-environment jsdom */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContributionDefaults } from '@/crd/forms/callout/types';

const harness = vi.hoisted(() => ({
  applyDraft: vi.fn(),
  allowedTypes: [] as string[],
  selectedTemplateContent: undefined as
    | { type: 'post'; defaultDescription: string }
    | { type: 'whiteboard'; sourceWhiteboardId: string }
    | undefined,
  selectedTemplateId: undefined as string | undefined,
  onCancel: undefined as (() => Promise<boolean>) | undefined,
  dialogOpenChange: undefined as ((open: boolean) => void) | undefined,
  whiteboardApplyDraft: vi.fn(),
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
    whiteboardSlot,
    onCancel,
    onOpenChange,
    values,
  }: {
    templateSlot?: (args: { applyDraft: typeof harness.applyDraft }) => ReactNode;
    whiteboardSlot?: (args: {
      draft: ContributionDefaults;
      applyDraft: typeof harness.whiteboardApplyDraft;
    }) => ReactNode;
    onCancel?: () => Promise<boolean>;
    onOpenChange: (open: boolean) => void;
    values: ContributionDefaults;
  }) => {
    harness.onCancel = onCancel;
    harness.dialogOpenChange = onOpenChange;
    return (
      <>
        {templateSlot?.({ applyDraft: harness.applyDraft })}
        {whiteboardSlot?.({ draft: values, applyDraft: harness.whiteboardApplyDraft })}
      </>
    );
  },
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/WhiteboardDraftEditor', () => ({
  WhiteboardDraftEditor: () => <div data-testid="whiteboard-draft-editor" />,
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
    harness.onCancel = undefined;
    harness.dialogOpenChange = undefined;
    harness.whiteboardApplyDraft.mockReset();
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

  it('does not delete an already accepted draft when the dialog is reopened and cancelled', async () => {
    const discard = vi.fn().mockResolvedValue(true);
    const acceptedDraft = {
      whiteboardID: 'whiteboard-draft-1',
      sourceKey: ':',
    };

    render(
      <ResponseDefaultsConnector
        open={true}
        onOpenChange={vi.fn()}
        type="whiteboard"
        values={{
          ...values,
          whiteboardContentAvailable: true,
          whiteboardDraft: acceptedDraft,
        }}
        onSave={vi.fn()}
        whiteboardDraft={{
          handle: acceptedDraft,
          loading: false,
          materialize: vi.fn(),
          preparationRef: { current: null },
          prepareForConsumption: vi.fn().mockResolvedValue(true),
          prepared: vi.fn(),
          discard,
          consumed: vi.fn(),
        }}
      />
    );

    await waitFor(() => expect(harness.onCancel).toBeDefined());
    await expect(harness.onCancel?.()).resolves.toBe(true);
    expect(discard).not.toHaveBeenCalled();
  });

  it('discards a materialized draft when cancellation precedes the parent handle commit', async () => {
    const materialized = {
      whiteboardID: 'whiteboard-draft-uncommitted',
      sourceKey: ':',
    };
    const discard = vi.fn().mockResolvedValue(true);

    render(
      <ResponseDefaultsConnector
        open={true}
        onOpenChange={vi.fn()}
        type="whiteboard"
        values={values}
        onSave={vi.fn()}
        whiteboardDraft={{
          handle: undefined,
          loading: false,
          materialize: vi.fn().mockResolvedValue(materialized),
          preparationRef: { current: null },
          prepareForConsumption: vi.fn().mockResolvedValue(true),
          prepared: vi.fn(),
          discard,
          consumed: vi.fn(),
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'framing.edit' }));
    await waitFor(() =>
      expect(harness.whiteboardApplyDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          whiteboardDraft: materialized,
        })
      )
    );
    await act(async () => {
      await expect(harness.onCancel?.()).resolves.toBe(true);
    });

    expect(discard).toHaveBeenCalledOnce();
  });

  it('does not reopen the editor when materialization finishes after the dialog closes', async () => {
    let resolveMaterialize: ((value: { whiteboardID: string; sourceKey: string }) => void) | undefined;
    const materialized = {
      whiteboardID: 'whiteboard-draft-2',
      sourceKey: ':',
    };
    const materialize = vi.fn(
      () =>
        new Promise<{ whiteboardID: string; sourceKey: string }>(resolve => {
          resolveMaterialize = resolve;
        })
    );
    const onOpenChange = vi.fn();

    render(
      <ResponseDefaultsConnector
        open={true}
        onOpenChange={onOpenChange}
        type="whiteboard"
        values={values}
        onSave={vi.fn()}
        whiteboardDraft={{
          handle: materialized,
          loading: false,
          materialize,
          preparationRef: { current: null },
          prepareForConsumption: vi.fn().mockResolvedValue(true),
          prepared: vi.fn(),
          discard: vi.fn().mockResolvedValue(true),
          consumed: vi.fn(),
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'framing.edit' }));
    act(() => harness.dialogOpenChange?.(false));
    await act(async () => resolveMaterialize?.(materialized));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(harness.whiteboardApplyDraft).not.toHaveBeenCalled();
    expect(screen.queryByTestId('whiteboard-draft-editor')).not.toBeInTheDocument();
  });
});

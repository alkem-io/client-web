import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UseCreateSubspaceResult } from './useCreateSubspace';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

// The four dialogs are stubbed down to open/closed markers: what is under test is
// which of them the flow mounts, not what they render.
vi.mock('@/crd/components/space/settings/CreateSubspaceDialog', () => ({
  CreateSubspaceDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="create-subspace-dialog" /> : null),
}));

vi.mock('@/crd/components/templates/TemplatePicker', () => ({
  TemplatePicker: () => <div data-testid="template-picker" />,
}));

vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({
  ConfirmationDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="overwrite-confirm" /> : null),
}));

vi.mock('@/crd/components/common/ImageCropDialog', () => ({
  ImageCropDialog: ({ open, file }: { open: boolean; file?: File }) =>
    open ? <div data-testid="image-crop-dialog">{file?.name}</div> : null,
}));

import { CreateSubspaceDialogs } from './CreateSubspaceDialogs';

function createSubspaceResult(overrides: Partial<UseCreateSubspaceResult> = {}): UseCreateSubspaceResult {
  return {
    open: true,
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    values: {
      displayName: '',
      tagline: '',
      description: '',
      tags: [],
      spaceTemplateId: '',
      avatarFile: null,
      cardBannerFile: null,
    },
    errors: {},
    pendingCrop: null,
    onCropComplete: vi.fn(),
    onCropCancel: vi.fn(),
    picker: {} as UseCreateSubspaceResult['picker'],
    onOpenTemplatePicker: vi.fn(),
    onClearTemplate: vi.fn(),
    selectedTemplateName: undefined,
    selectedTemplateContent: undefined,
    selectedTemplateLoading: false,
    overwriteConfirmOpen: false,
    onConfirmOverwriteTemplate: vi.fn(),
    onCancelOverwriteTemplate: vi.fn(),
    submitting: false,
    canSubmit: true,
    avatarConstraints: null,
    cardBannerConstraints: null,
    onChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CreateSubspaceDialogs', () => {
  it('mounts the crop dialog for a pending visual so an image pick is not swallowed', () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    render(
      <CreateSubspaceDialogs
        createSubspace={createSubspaceResult({ pendingCrop: { key: 'avatarFile', file, config: {} } })}
      />
    );

    expect(screen.getByTestId('image-crop-dialog')).toHaveTextContent('avatar.png');
  });

  it('keeps the crop dialog closed while no visual is pending', () => {
    render(<CreateSubspaceDialogs createSubspace={createSubspaceResult()} />);

    expect(screen.queryByTestId('image-crop-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('create-subspace-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('template-picker')).toBeInTheDocument();
  });

  it('mounts the template-overwrite confirmation when the flow asks for it', () => {
    render(<CreateSubspaceDialogs createSubspace={createSubspaceResult({ overwriteConfirmOpen: true })} />);

    expect(screen.getByTestId('overwrite-confirm')).toBeInTheDocument();
  });
});

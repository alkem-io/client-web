import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/core/ui/dialog/DialogWithGrid', () => ({
  default: ({ open, children }: { open?: boolean; children?: ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
}));

vi.mock('@/core/ui/dialog/DialogHeader', () => ({
  default: ({ title }: { title?: ReactNode }) => <h2>{title}</h2>,
}));

vi.mock('@/core/ui/grid/Gutters', () => ({
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

const resolveMock = vi.fn();
vi.mock('./useResolveSpaceUrl', () => ({
  default: () => ({ resolve: resolveMock }),
}));

import AddSpaceByUrlDialog from './AddSpaceByUrlDialog';

const SUBMIT_LABEL = 'pages.admin.innovationHub.spaceListFilter.addByUrl.submit';
const INVALID_KEY = 'pages.admin.innovationHub.spaceListFilter.addByUrl.invalidSpaceUrl';
const DUPLICATE_KEY = 'pages.admin.innovationHub.spaceListFilter.addByUrl.alreadyAdded';
const VALIDATING_KEY = 'pages.admin.innovationHub.spaceListFilter.addByUrl.validating';

const renderDialog = (overrides: Partial<React.ComponentProps<typeof AddSpaceByUrlDialog>> = {}) => {
  const onClose = vi.fn();
  const onAdd = vi.fn().mockResolvedValue(undefined);
  const utils = render(
    <AddSpaceByUrlDialog open={true} onClose={onClose} onAdd={onAdd} existingSpaceIds={[]} {...overrides} />
  );
  return { ...utils, onClose, onAdd };
};

const getInput = () => screen.getByLabelText('pages.admin.innovationHub.spaceListFilter.addByUrl.urlInputLabel');
const getSubmit = () => screen.getByRole('button', { name: SUBMIT_LABEL });

describe('AddSpaceByUrlDialog', () => {
  beforeEach(() => {
    resolveMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Story 1 — happy path', () => {
    test('submit is disabled when input is empty', () => {
      renderDialog();
      expect(getSubmit()).toBeDisabled();
    });

    test('submit is disabled when input is not a URL', () => {
      renderDialog();
      fireEvent.change(getInput(), { target: { value: 'not a url' } });
      expect(getSubmit()).toBeDisabled();
    });

    test('submit is disabled when input is whitespace only', () => {
      renderDialog();
      fireEvent.change(getInput(), { target: { value: '   ' } });
      expect(getSubmit()).toBeDisabled();
    });

    test('submit is enabled when input is a syntactically valid URL', () => {
      renderDialog();
      fireEvent.change(getInput(), { target: { value: 'https://example.com/abc' } });
      expect(getSubmit()).toBeEnabled();
    });

    test('on success, calls onAdd with the resolved space id and then onClose', async () => {
      resolveMock.mockResolvedValue({ kind: 'ok', spaceId: 'space-xyz' });
      const { onAdd, onClose } = renderDialog();

      fireEvent.change(getInput(), { target: { value: 'https://example.com/welcome-space' } });
      fireEvent.click(getSubmit());

      await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
      expect(onAdd).toHaveBeenCalledWith('space-xyz');
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    test('renders the validating status while resolution is pending', async () => {
      let resolveResolve: (v: { kind: 'ok'; spaceId: string }) => void = () => {};
      resolveMock.mockReturnValue(
        new Promise(r => {
          resolveResolve = r;
        })
      );
      renderDialog();

      fireEvent.change(getInput(), { target: { value: 'https://example.com/welcome-space' } });
      fireEvent.click(getSubmit());

      await waitFor(() => expect(screen.getByText(VALIDATING_KEY)).toBeInTheDocument());
      expect(getSubmit()).toBeDisabled();

      await act(async () => {
        resolveResolve({ kind: 'ok', spaceId: 'space-xyz' });
      });
    });
  });

  describe('User Story 2 — generic error path', () => {
    test('renders the generic error when resolve returns invalid', async () => {
      resolveMock.mockResolvedValue({ kind: 'invalid' });
      const { onAdd, onClose } = renderDialog();

      fireEvent.change(getInput(), { target: { value: 'https://example.com/foo' } });
      fireEvent.click(getSubmit());

      await waitFor(() => expect(screen.getByText(INVALID_KEY)).toBeInTheDocument());
      expect(onAdd).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    test('error message clears when the input changes', async () => {
      resolveMock.mockResolvedValue({ kind: 'invalid' });
      renderDialog();

      fireEvent.change(getInput(), { target: { value: 'https://example.com/foo' } });
      fireEvent.click(getSubmit());
      await waitFor(() => expect(screen.getByText(INVALID_KEY)).toBeInTheDocument());

      fireEvent.change(getInput(), { target: { value: 'https://example.com/foo2' } });
      expect(screen.queryByText(INVALID_KEY)).not.toBeInTheDocument();
    });

    test('error renders with role=alert for screen readers', async () => {
      resolveMock.mockResolvedValue({ kind: 'invalid' });
      renderDialog();

      fireEvent.change(getInput(), { target: { value: 'https://example.com/foo' } });
      fireEvent.click(getSubmit());

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(INVALID_KEY);
      });
    });
  });

  describe('User Story 3 — already added', () => {
    test('renders the duplicate message when resolved space id is already in the hub', async () => {
      resolveMock.mockResolvedValue({ kind: 'ok', spaceId: 'space-xyz' });
      const { onAdd, onClose } = renderDialog({ existingSpaceIds: ['space-xyz'] });

      fireEvent.change(getInput(), { target: { value: 'https://example.com/welcome-space' } });
      fireEvent.click(getSubmit());

      await waitFor(() => expect(screen.getByText(DUPLICATE_KEY)).toBeInTheDocument());
      expect(onAdd).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    test('duplicate message clears when the input changes', async () => {
      resolveMock.mockResolvedValue({ kind: 'ok', spaceId: 'space-xyz' });
      renderDialog({ existingSpaceIds: ['space-xyz'] });

      fireEvent.change(getInput(), { target: { value: 'https://example.com/welcome-space' } });
      fireEvent.click(getSubmit());
      await waitFor(() => expect(screen.getByText(DUPLICATE_KEY)).toBeInTheDocument());

      fireEvent.change(getInput(), { target: { value: 'https://example.com/other' } });
      expect(screen.queryByText(DUPLICATE_KEY)).not.toBeInTheDocument();
    });
  });
});

import { act, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDialogCloseGuard } from './useDialogCloseGuard';

type DiscardProps = { open: boolean; onConfirm: () => void; onCancel: () => void };
const discardProps = (el: ReactElement): DiscardProps => el.props as DiscardProps;

describe('useDialogCloseGuard', () => {
  it('closes immediately when clean (no discard prompt)', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogCloseGuard({ isDirty: false, onClose }));

    act(() => result.current.requestClose());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(discardProps(result.current.guardElement).open).toBe(false);
  });

  it('opens the discard dialog instead of closing when dirty', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogCloseGuard({ isDirty: true, onClose }));

    act(() => result.current.requestClose());

    expect(onClose).not.toHaveBeenCalled();
    expect(discardProps(result.current.guardElement).open).toBe(true);
  });

  it('confirming the discard dialog calls onClose and closes the prompt', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogCloseGuard({ isDirty: true, onClose }));

    act(() => result.current.requestClose());
    act(() => discardProps(result.current.guardElement).onConfirm());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(discardProps(result.current.guardElement).open).toBe(false);
  });

  it('cancelling the discard dialog keeps the dialog open (no onClose)', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogCloseGuard({ isDirty: true, onClose }));

    act(() => result.current.requestClose());
    act(() => discardProps(result.current.guardElement).onCancel());

    expect(onClose).not.toHaveBeenCalled();
    expect(discardProps(result.current.guardElement).open).toBe(false);
  });

  it('ignores close attempts entirely while blockClose is true', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogCloseGuard({ isDirty: true, onClose, blockClose: true }));

    act(() => result.current.requestClose());

    expect(onClose).not.toHaveBeenCalled();
    expect(discardProps(result.current.guardElement).open).toBe(false);
  });

  it('handleOpenChange(false) routes through the guard; (true) is a no-op', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogCloseGuard({ isDirty: false, onClose }));

    act(() => result.current.handleOpenChange(true));
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current.handleOpenChange(false));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

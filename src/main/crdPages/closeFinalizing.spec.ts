import { describe, expect, it, vi } from 'vitest';
import { withCloseFinalizing } from '@/main/crdPages/closeFinalizing';

describe('withCloseFinalizing', () => {
  it('covers only the durability wait and clears after success', async () => {
    const states: boolean[] = [];
    let release!: () => void;
    const operation = withCloseFinalizing(
      state => states.push(state),
      () => new Promise<void>(resolve => (release = resolve))
    );

    expect(states).toEqual([true]);
    release();
    await operation;
    expect(states).toEqual([true, false]);
  });

  it('clears before forwarding a durability failure', async () => {
    const setFinalizing = vi.fn();

    await expect(withCloseFinalizing(setFinalizing, () => Promise.reject(new Error('offline')))).rejects.toThrow(
      'offline'
    );
    expect(setFinalizing.mock.calls).toEqual([[true], [false]]);
  });
});

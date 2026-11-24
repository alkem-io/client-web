import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CallBanner } from './CallBanner';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (key === 'call.banner.participantsTwo') return `${values?.first} and ${values?.second}`;
      if (key === 'call.banner.participantsMore')
        return `${values?.first}, ${values?.second} and ${values?.count} more`;
      if (key === 'call.banner.calling') return `${values?.name} is calling you`;
      return key;
    },
  }),
}));

describe('CallBanner', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('running call', () => {
    test('announces who is in the call and how long it has run, and the elapsed time ticks', () => {
      vi.useFakeTimers({ now: new Date(2026, 10, 24, 12, 4, 12) });
      render(
        <CallBanner
          variant="running"
          names={['Ana', 'Marc', 'Lee']}
          startedAt={new Date(2026, 10, 24, 12, 0, 0).getTime()}
          onJoin={vi.fn()}
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveTextContent('call.banner.inProgress');
      expect(banner).toHaveTextContent('Ana, Marc and 1 more · 04:12');

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(banner).toHaveTextContent('Ana, Marc and 1 more · 04:14');
      // Not announced on every tick, yet still there for a screen reader to read.
      expect(screen.getByText(/04:14/)).toHaveAttribute('aria-live', 'off');
      expect(screen.getByText(/04:14/)).not.toHaveAttribute('aria-hidden');
    });

    test('names one or two people in full and leaves out an unknown start time', () => {
      const { rerender } = render(<CallBanner variant="running" names={['Ana']} onJoin={vi.fn()} />);
      expect(screen.getByRole('status')).toHaveTextContent(/^call\.banner\.inProgressAna/);

      rerender(<CallBanner variant="running" names={['Ana', 'Marc']} onJoin={vi.fn()} />);
      expect(screen.getByRole('status')).toHaveTextContent('Ana and Marc');
      expect(screen.getByRole('status')).not.toHaveTextContent('·');
    });

    test('shows hours once the call has run an hour', () => {
      vi.useFakeTimers({ now: new Date(2026, 10, 24, 13, 2, 5) });
      render(<CallBanner variant="running" names={['Ana']} startedAt={new Date(2026, 10, 24, 12, 0, 0).getTime()} />);
      expect(screen.getByRole('status')).toHaveTextContent('Ana · 1:02:05');
    });

    test('a visible Join joins with video, and the secondary button joins with audio only', async () => {
      const onJoin = vi.fn();
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      render(<CallBanner variant="running" names={['Ana']} onJoin={onJoin} />);

      expect(screen.getByRole('group', { name: 'call.join' })).toBeInTheDocument();
      const joinVideo = screen.getByRole('button', { name: 'call.joinVideo' });
      expect(joinVideo).toHaveTextContent('call.join');

      await user.click(joinVideo);
      expect(onJoin).toHaveBeenLastCalledWith('video');
      await user.click(screen.getByRole('button', { name: 'call.joinAudio' }));
      expect(onJoin).toHaveBeenLastCalledWith('voice');
    });

    test('already joined on this device: the note shows instead of Join', () => {
      render(<CallBanner variant="running" names={['Ana']} />);

      expect(screen.getByRole('status')).toHaveTextContent('call.joinedOnThisDevice');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('ringing', () => {
    test('says who is calling and offers Answer and a named Decline, both keyboard-operable', async () => {
      const onAnswer = vi.fn();
      const onDecline = vi.fn();
      const user = userEvent.setup();
      render(<CallBanner variant="ringing" callerName="Ana" onAnswer={onAnswer} onDecline={onDecline} />);

      expect(screen.getByRole('alert')).toHaveTextContent('Ana is calling you');
      expect(screen.queryByRole('button', { name: 'call.joinVideo' })).not.toBeInTheDocument();

      await user.tab();
      expect(screen.getByRole('button', { name: 'call.banner.decline' })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onDecline).toHaveBeenCalledOnce();

      await user.tab();
      expect(screen.getByRole('button', { name: 'call.banner.answer' })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onAnswer).toHaveBeenCalledOnce();
    });
  });
});

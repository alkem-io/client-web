import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ActiveCallIndicator } from './ActiveCallIndicator';

describe('ActiveCallIndicator', () => {
  test('shows the active state with the participant count and both join buttons', async () => {
    const onJoinVideo = vi.fn();
    const onJoinAudio = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <ActiveCallIndicator
        activeLabel="Call active"
        count={2}
        join={{
          joinLabel: 'Join',
          joinVideoLabel: 'Join with video',
          joinAudioLabel: 'Join with audio only',
          onJoinVideo,
          onJoinAudio,
        }}
      />
    );

    expect(screen.getByText('Call active')).toBeInTheDocument();
    expect(screen.getByTestId('call-participant-count')).toHaveTextContent('2');
    expect(screen.getByRole('group', { name: 'Join' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Join with video' }));
    expect(onJoinVideo).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Join with audio only' }));
    expect(onJoinAudio).toHaveBeenCalledTimes(1);
  });

  test('offers no join when there is nothing to join', () => {
    render(<ActiveCallIndicator activeLabel="Call active" count={1} />);
    expect(screen.getByTestId('call-participant-count')).toHaveTextContent('1');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('says why there is nothing to join when a note is given', () => {
    render(<ActiveCallIndicator activeLabel="Call active" count={1} joinedNote="Already joined on this device" />);
    expect(screen.getByText('Already joined on this device')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CallControls } from './CallControls';

describe('CallControls', () => {
  test('renders both start buttons named by their labels and calls their callbacks', async () => {
    const onStartAudio = vi.fn();
    const onStartVideo = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <CallControls
        startAudioLabel="Start audio call"
        startVideoLabel="Start video call"
        onStartAudio={onStartAudio}
        onStartVideo={onStartVideo}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Start audio call' }));
    expect(onStartAudio).toHaveBeenCalledTimes(1);
    expect(onStartVideo).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Start video call' }));
    expect(onStartVideo).toHaveBeenCalledTimes(1);
  });
});

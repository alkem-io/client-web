import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Header } from './Header';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const hrefs = {} as Parameters<typeof Header>[0]['navigationHrefs'];

it('shows the plain messages icon when nobody is calling', () => {
  render(<Header authenticated={true} navigationHrefs={hrefs} onMessagesClick={() => {}} />);
  expect(screen.getByRole('button', { name: 'header.messages' })).toBeInTheDocument();
  expect(screen.queryByTestId('header-call-ringing')).not.toBeInTheDocument();
});

it('turns the messages icon into a ringing phone named after the call', () => {
  render(
    <Header
      authenticated={true}
      navigationHrefs={hrefs}
      onMessagesClick={() => {}}
      incomingCallLabel="Maria is calling you"
    />
  );
  expect(screen.getByRole('button', { name: 'Maria is calling you. header.messages' })).toBeInTheDocument();
  expect(screen.getByTestId('header-call-ringing')).toBeInTheDocument();
});

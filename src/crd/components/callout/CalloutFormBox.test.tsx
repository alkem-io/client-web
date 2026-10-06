import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { CalloutFormFillIn } from '@/crd/components/callout/CalloutFormFillIn';
import { CalloutFormOwnResponses } from '@/crd/components/callout/CalloutFormOwnResponses';
import type { FormQuestionView } from '@/crd/components/callout/calloutFormTypes';
import { CalloutFormBox } from './CalloutFormBox';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'count' in params ? `${key}#${params.count}` : key,
    i18n: { language: 'en' },
  }),
}));

const questions: FormQuestionView[] = [
  { id: 'q1', prompt: 'Your name', type: 'SHORT_TEXT', required: false, options: [] },
  { id: 'q2', prompt: 'Your story', type: 'LONG_TEXT', required: false, options: [] },
  {
    id: 'q3',
    prompt: 'Colour',
    type: 'SINGLE_CHOICE',
    required: false,
    options: [
      { id: 'red', label: 'Red' },
      { id: 'blue', label: 'Blue' },
    ],
  },
];

type BoxProps = ComponentProps<typeof CalloutFormBox>;

const fillIn = (overrides: Partial<ComponentProps<typeof CalloutFormFillIn>> = {}) => (
  <CalloutFormFillIn
    questions={questions}
    state="OPEN"
    published={true}
    canSubmit={true}
    submitting={false}
    onSubmit={vi.fn()}
    {...overrides}
  />
);

const renderBox = (overrides: Partial<BoxProps> = {}, children = fillIn()) =>
  render(
    <CalloutFormBox
      title="Q4 planning"
      description={'Tell us where to focus.\nSecond line.'}
      questionCount={questions.length}
      visibility="ADMINS"
      spaceName="Garden"
      defaultCollapsed={false}
      {...overrides}
    >
      {children}
    </CalloutFormBox>
  );

const expectHeader = (title = 'Q4 planning') => {
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  expect(screen.getByText('formFillIn.questionCount#3')).toBeInTheDocument();
  expect(screen.getByText('formFillIn.noticeAdmins')).toBeInTheDocument();
  expect(screen.getByText(/Tell us where to focus\./)).toBeInTheDocument();
};

describe('CalloutFormBox', () => {
  test('the header shows the title, the question count, the notice and the description', () => {
    renderBox();
    expectHeader();
    expect(screen.getByRole('region', { name: 'Q4 planning' })).toBeInTheDocument();
    expect(screen.getByText(/Tell us where to focus\./)).toHaveClass('whitespace-pre-line');
  });

  test('an untitled Form falls back to the generic "Form" heading', () => {
    renderBox({ title: '  ' });
    expect(screen.getByRole('heading', { name: 'formFillIn.untitled' })).toBeInTheDocument();
  });

  test('the members notice is shown for Space-members visibility', () => {
    renderBox({ visibility: 'MEMBERS' });
    expect(screen.getByText('formFillIn.noticeMembers')).toBeInTheDocument();
    expect(screen.queryByText('formFillIn.noticeAdmins')).toBeNull();
  });

  test('the header is the same in the fill-in, own-responses, closed and no-permission states', () => {
    const { unmount: a } = renderBox();
    expectHeader();
    a();

    const { unmount: b } = renderBox(
      {},
      <CalloutFormOwnResponses
        responses={[{ id: 'r1', createdDate: new Date('2026-10-01'), answers: [] }]}
        questions={questions}
        onWithdraw={vi.fn()}
      />
    );
    expectHeader();
    b();

    const { unmount: c } = renderBox({ status: 'CLOSED' }, fillIn({ state: 'CLOSED', canSubmit: false }));
    expectHeader();
    expect(screen.getByText('formFillIn.closedBadge')).toBeInTheDocument();
    c();

    renderBox({}, fillIn({ canSubmit: false }));
    expectHeader();
  });

  test('the footer renders only together with the fill-in', () => {
    const { unmount } = renderBox();
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'formFillIn.cancel' })).toBeInTheDocument();
    unmount();

    renderBox(
      {},
      <CalloutFormOwnResponses
        responses={[{ id: 'r1', createdDate: new Date('2026-10-01'), answers: [] }]}
        questions={questions}
        onWithdraw={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'formFillIn.cancel' })).toBeNull();
  });

  test('collapsed by default shows the header only; the chevron expands the body', async () => {
    renderBox({ defaultCollapsed: true });
    expectHeader();
    expect(screen.queryByRole('textbox', { name: /Your name/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();

    const chevron = screen.getByRole('button', { name: 'formFillIn.expand' });
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(chevron.getAttribute('aria-controls') ?? '')).not.toBeNull();

    await userEvent.click(chevron);
    expect(screen.getByRole('textbox', { name: /Your name/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'formFillIn.collapse' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('expanded by default shows the questions; collapsing keeps the typed answers', async () => {
    renderBox({ defaultCollapsed: false });
    const name = screen.getByRole('textbox', { name: /Your name/ });
    await userEvent.type(name, 'Ada');

    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.collapse' }));
    expect(screen.queryByRole('textbox', { name: /Your name/ })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.expand' }));
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveValue('Ada');
  });

  test('two mounted boxes keep independent collapse state', async () => {
    render(
      <>
        <CalloutFormBox title="Inline" questionCount={3} visibility="ADMINS" spaceName="Garden" defaultCollapsed={true}>
          {fillIn()}
        </CalloutFormBox>
        <CalloutFormBox title="Dialog" questionCount={3} visibility="ADMINS" spaceName="Garden" defaultCollapsed={true}>
          {fillIn()}
        </CalloutFormBox>
      </>
    );

    const inline = screen.getByRole('region', { name: 'Inline' });
    const dialog = screen.getByRole('region', { name: 'Dialog' });
    await userEvent.click(within(inline).getByRole('button', { name: 'formFillIn.expand' }));

    expect(within(inline).getByRole('textbox', { name: /Your name/ })).toBeInTheDocument();
    expect(within(dialog).queryByRole('textbox', { name: /Your name/ })).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'formFillIn.expand' })).toBeInTheDocument();
  });

  test('toggling never calls any data callback', async () => {
    const onSubmit = vi.fn();
    const onViewResponses = vi.fn();
    renderBox({ onViewResponses, responseCount: 2 }, fillIn({ onSubmit }));

    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.collapse' }));
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.expand' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onViewResponses).not.toHaveBeenCalled();
  });

  test('admins keep the review entry point in the header, also when collapsed', async () => {
    const onViewResponses = vi.fn();
    renderBox({ onViewResponses, responseCount: 2, defaultCollapsed: true });

    await userEvent.click(screen.getByRole('button', { name: 'formResponses.viewAction#2' }));
    expect(onViewResponses).toHaveBeenCalledTimes(1);
  });

  test('the header carries no close control', () => {
    renderBox();
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });
});

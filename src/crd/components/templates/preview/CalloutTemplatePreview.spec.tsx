/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import type { TemplateContent } from '../types';
import { CalloutTemplatePreview } from './CalloutTemplatePreview';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-templates');
});

const formTemplate: Extract<TemplateContent, { type: 'callout' }> = {
  type: 'callout',
  framingKind: 'form',
  framingTitle: 'Sign-up',
  framingDescription: '',
  framingForm: {
    title: 'Join the session',
    description: 'Tell us who you are',
    questions: [
      { prompt: 'Your name', type: 'SHORT_TEXT', required: true, options: [] },
      {
        prompt: 'Track',
        explanation: 'Pick one',
        type: 'SINGLE_CHOICE',
        required: false,
        options: ['Design', 'Build'],
      },
    ],
  },
  allowedContributionTypes: [],
  commentsEnabled: false,
};

describe('CalloutTemplatePreview — Form framing', () => {
  it('lists the questions read-only: numbered prompt, answer type, required marker and choices', () => {
    render(<CalloutTemplatePreview content={formTemplate} />);

    expect(screen.getByText('Form')).toBeInTheDocument();
    expect(screen.getByText('Join the session')).toBeInTheDocument();
    expect(screen.getByText('Tell us who you are')).toBeInTheDocument();

    const list = screen.getByRole('list', { name: 'Questions' });
    const items = Array.from(list.children) as HTMLElement[];
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText('1.')).toBeInTheDocument();
    expect(within(items[0]).getByText('Your name')).toBeInTheDocument();
    expect(within(items[0]).getByText('Short text')).toBeInTheDocument();
    expect(within(items[0]).getByText('Required')).toBeInTheDocument();

    expect(within(items[1]).getByText('2.')).toBeInTheDocument();
    expect(within(items[1]).getByText('Track')).toBeInTheDocument();
    expect(within(items[1]).getByText('Pick one')).toBeInTheDocument();
    expect(within(items[1]).getByText('Single choice')).toBeInTheDocument();
    expect(within(items[1]).queryByText('Required')).not.toBeInTheDocument();
    expect(within(items[1]).getByText('Design')).toBeInTheDocument();
    expect(within(items[1]).getByText('Build')).toBeInTheDocument();
  });

  it('offers no way to answer: no inputs and no submit button', () => {
    render(<CalloutTemplatePreview content={formTemplate} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing for the framing when the definition is missing', () => {
    render(<CalloutTemplatePreview content={{ ...formTemplate, framingForm: undefined }} />);
    expect(screen.queryByRole('list', { name: 'Questions' })).not.toBeInTheDocument();
  });
});

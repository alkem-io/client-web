import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { describe, expect, test, vi } from 'vitest';
import PollFormFields from './PollFormFields';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/core/apollo/generated/graphql-schema', async () => {
  const actual = await vi.importActual('@/core/apollo/generated/graphql-schema');
  return {
    ...actual,
    PollResultsVisibility: { Visible: 'VISIBLE', Hidden: 'HIDDEN', TotalOnly: 'TOTAL_ONLY' },
    PollResultsDetail: { Full: 'FULL', Count: 'COUNT', Percentage: 'PERCENTAGE' },
  };
});

const defaultValues = {
  framing: {
    profile: { displayName: '', description: '', tagsets: [], references: [] },
    type: 'POLL' as const,
    poll: {
      title: '',
      options: ['', ''],
      settings: {
        minResponses: 1,
        maxResponses: 1,
        resultsVisibility: 'VISIBLE' as never,
        resultsDetail: 'FULL' as never,
      },
    },
  },
};

const renderWithFormik = (initialValues = defaultValues) =>
  render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <PollFormFields />
    </Formik>
  );

describe('PollFormFields', () => {
  test('renders with minimum 2 option inputs', () => {
    renderWithFormik();

    const optionInputs = screen.getAllByRole('textbox');
    // Title input + 2 option inputs = 3
    expect(optionInputs.length).toBeGreaterThanOrEqual(3);
  });

  test('renders add option button', () => {
    renderWithFormik();

    const addButton = screen.getByText('poll.options.add');
    expect(addButton).toBeDefined();
  });

  test('renders options header', () => {
    renderWithFormik();

    const optionsHeader = screen.getByText('poll.create.options');
    expect(optionsHeader).toBeDefined();
  });

  test('does not show remove button when only 2 options', () => {
    renderWithFormik();

    const removeButtons = screen.queryAllByLabelText('poll.options.remove');
    expect(removeButtons.length).toBe(0);
  });

  test('shows remove buttons when more than 2 options', () => {
    const valuesWithThreeOptions = {
      ...defaultValues,
      framing: {
        ...defaultValues.framing,
        poll: {
          ...defaultValues.framing.poll,
          options: ['A', 'B', 'C'],
        },
      },
    };

    renderWithFormik(valuesWithThreeOptions);

    const removeButtons = screen.getAllByLabelText('poll.options.remove');
    expect(removeButtons.length).toBe(3);
  });
});

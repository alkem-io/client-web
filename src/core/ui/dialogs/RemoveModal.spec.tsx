/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event';
import { render, screen } from '@main/test/testUtils';
import RemoveModal from './RemoveModal';
import { expect, test, describe } from 'vitest';

describe('RemoveModal - main', () => {
  const show = true;
  const text = 'text';
  const title = 'confirm';
  const onCancel = () => {};
  const onConfirm = () => {};

  test('renders correct RemoveModal component', () => {
    // arrange
    const { asFragment } = render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });

  test.skip('renders correct modal text', () => {
    // arrange
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // assert
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test.skip('renders correct modal title', () => {
    // arrange
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} title={title} />);

    // assert
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  test.skip('calls modal cancel button', () => {
    // arrange
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // act
    userEvent.click(screen.getByText('Remove'));

    // assert
    //toDo - fix expect(onCancel).toHaveBeenCalled(0);
    //toDo - fix expect(onConfirm).toHaveBeenCalled(1);
  });

  test.skip('calls modal remove button', () => {
    // arrange
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // act
    userEvent.click(screen.getByText('Remove'));

    // assert
    //toDo fix expect(onCancel).toHaveBeenCalled(0);
    //toDo fix expect(onConfirm).toHaveBeenCalled(1);
  });
});

describe('RemoveModal - negative', () => {
  test.skip('modal is not loaded', () => {
    // arrange
    const show = false;
    const text = 'experiment';
    const title = 'confirm';
    const onCancel = () => {};
    const onConfirm = () => {};
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} title={title} />);

    // assert
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });
});

import { render, screen } from '@testing-library/react';
import RemoveModal from './RemoveModal';
import userEvent from '@testing-library/user-event';

describe('RemoveModal - main', () => {
  const show = true;
  const text = 'text';
  const title = 'confirm';
  const onCancel = jest.fn();
  const onConfirm = jest.fn();

  test('renders correct RemoveModal component', () => {
    // arrange
    const { asFragment } = render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });

  test('renders correct modal text', () => {
    // arrange
    const wrapper = render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // assert
    expect(wrapper.getByText(text)).toBeInTheDocument();
  });

  test('renders correct modal title', () => {
    // arrange
    const wrapper = render(
      <RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} title={title} />
    );

    // assert
    expect(wrapper.getByText(title)).toBeInTheDocument();
  });

  test('calls modal cancel button', () => {
    // arrange
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // act
    userEvent.click(screen.getByText('Cancel'));

    // assert
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(0);
  });

  test('calls modal remove button', () => {
    // arrange
    render(<RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} />);

    // act
    userEvent.click(screen.getByText('Remove'));

    // assert
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('RemoveModal - negative', () => {
  test('modal is not loaded', () => {
    // arrange
    const show = false;
    const text = 'experiment';
    const title = 'confirm';
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const wrapper = render(
      <RemoveModal show={show} onCancel={onCancel} onConfirm={onConfirm} text={text} title={title} />
    );

    // assert
    expect(wrapper.queryAllByRole('dialog')).toHaveLength(0);
  });
});

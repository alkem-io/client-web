import TextInput, { TextArea } from './TextInput';
import { render, screen } from '../../utils/test/test-utils';
import userEvent from '@testing-library/user-event';

describe('TextIpnut component', () => {
  // arrange
  const value = 'test value';
  const onChange = jest.fn();
  const label = 'test label';

  test('render correctly TextInput/Input component', () => {
    // act
    const { asFragment } = render(
      <TextInput onChange={onChange} value={value} label={label} inset={true} small={true} disabled={true} />
    );
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });

  test('render correctly TextArea/Input component', () => {
    // act
    const { asFragment } = render(
      <TextArea onChange={onChange} value={value} label={label} inset={true} small={true} disabled={true} />
    );
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });

  test('disabled="true" input', () => {
    // act
    const { container } = render(
      <TextArea onChange={onChange} value={value} label={label} inset={true} small={true} disabled={true} />
    );
    userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!');

    // assert
    expect(screen.getByRole('textbox')).toHaveValue(value);
    expect(onChange).toHaveBeenCalledTimes(0);
    expect(container.querySelector('textarea')).toHaveAttribute('disabled');
  });

  test('TextArea onChange event', async () => {
    // act
    render(<TextArea onChange={onChange} value={value} label={label} inset={true} small={true} disabled={false} />);
    userEvent.clear(screen.getByRole('textbox'));
    userEvent.type(screen.getByRole('textbox'), 'ab{enter}a');

    // assert
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  test('TextInput disabled="false" input', async () => {
    // act
    render(<TextInput onChange={onChange} value={value} label={label} inset={true} small={true} disabled={false} />);
    userEvent.clear(screen.getByRole('textbox'));
    userEvent.type(screen.getByRole('textbox'), 'ab{enter}a');

    // assert
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  test('TextArea has value', async () => {
    // act
    render(<TextArea onChange={onChange} value={value} label={label} inset={true} small={true} disabled={false} />);

    // assert
    expect(screen.getByRole('textbox')).toHaveValue(value);
  });

  test('TextInput has value', async () => {
    // act
    render(<TextInput onChange={onChange} value={value} label={label} inset={true} small={true} disabled={false} />);

    // assert
    expect(screen.getByRole('textbox')).toHaveValue(value);
  });

  test('TextArea has label', async () => {
    // act
    render(<TextArea onChange={onChange} value={value} label={label} inset={true} small={true} disabled={false} />);

    // assert
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test('TextInput has label', async () => {
    // act
    render(<TextInput onChange={onChange} value={value} label={label} inset={true} small={true} disabled={false} />);

    // assert
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

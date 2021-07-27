import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { Dropdown, FormControl } from 'react-bootstrap';
import { createStyles } from '../../hooks';
// import Button from './Button';

const NOT_SELECTED = 'Not selected';

interface Props {
  data: string[];
  onSelect: (value: string | null) => void;
  value: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const useSearchDropdownStyles = createStyles(() => ({
  menu: {
    width: '100%',
  },
  list: {
    maxHeight: 300,
    overflow: 'auto',
  },
  search: {
    width: 'calc(100% - 32px)',
  },
  toggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #ced4da',
    backgroundColor: '#fff',
    color: '#495057',
    width: '100%',
    '&:hover': {
      border: '1px solid #ced4da',
      backgroundColor: '#fff',
      color: '#495057',
    },
    '&:focus': {
      border: '1px solid #ced4da',
      backgroundColor: '#fff',
      color: '#495057',
    },
  },
}));

const SearchDropdown: FC<Props> = ({ onSelect, data, value, readOnly = false, disabled = false }) => {
  const styles = useSearchDropdownStyles();
  // forwardRef again here!
  // Dropdown needs access to the DOM of the Menu to measure it
  const CustomMenu = React.forwardRef(({ children, style, className, 'aria-labelledby': labeledBy }: any, ref: any) => {
    const [value, setValue] = useState<string>('');

    return (
      <div ref={ref} style={style} className={clsx(styles.menu, className)} aria-labelledby={labeledBy}>
        <FormControl
          autoFocus={true}
          className={clsx('mx-3', 'my-2', 'w-95', styles.search)}
          placeholder="Type to filter.."
          onChange={e => setValue(e.target.value)}
          value={value}
          disabled={disabled}
        />
        <ul className={clsx('list-unstyled', styles.list)}>
          {React.Children.toArray(children).filter(
            //@ts-ignore
            child => !value || child.props.children.toLowerCase().includes(value.toLowerCase())
          )}
        </ul>
      </div>
    );
  });

  if (readOnly || disabled)
    return <FormControl placeholder={NOT_SELECTED} value={value} readOnly={true} disabled={disabled} />;
  return (
    <Dropdown onSelect={v => onSelect(v)}>
      <Dropdown.Toggle className={styles.toggle} id="dropdown-custom-components">
        {value || NOT_SELECTED}
      </Dropdown.Toggle>

      <Dropdown.Menu as={CustomMenu}>
        {data.map((el, index) => (
          <Dropdown.Item key={index} eventKey={el}>
            {el}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SearchDropdown;

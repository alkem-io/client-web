import { Chip, InputAdornment, OutlinedTextFieldProps, TextField } from '@material-ui/core';
import React, { FC, forwardRef, useEffect, useState } from 'react';

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       display: 'flex',
//       width: '100%',
//       justifyContent: 'flex-start',
//       flexWrap: 'wrap',
//       '& > *': {
//         margin: theme.spacing(0.25),
//       },
//     },
//   })
// );

type TagsInputProps = OutlinedTextFieldProps & {
  onTagsChange?: (tags: string[]) => void;
  value: string[];
};

export const TagsInput: FC<TagsInputProps> = forwardRef(
  ({ InputProps, variant = 'outlined', onTagsChange, value, placeholder, ...rest }, ref) => {
    // const classes = useStyles();
    const [inputValue, setInputValue] = React.useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
      setSelectedItems(value);
    }, [value]);

    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();

        const newSelectedItems = [...selectedItems];
        const duplicatedValues = newSelectedItems.indexOf(event.target.value.trim());

        if (duplicatedValues !== -1) {
          setInputValue('');
          return;
        }
        if (!event.target.value.replace(/\s/g, '').length) return;

        newSelectedItems.push(event.target.value.trim());
        setSelectedItems(newSelectedItems);
        setInputValue('');
        onTagsChange && onTagsChange(newSelectedItems);
      }
      // Turn Off backspace delition.
      // if (selectedItems && selectedItems.length && !inputValue.length && event.key === 'Backspace') {
      //   const newSelectedItems = selectedItems.slice(0, selectedItems.length - 1);
      //   setSelectedItems(newSelectedItems);
      //   onTagsChange && onTagsChange(newSelectedItems);
      // }
    };

    const handleDelete = item => () => {
      const newSelectedItems = [...selectedItems];
      newSelectedItems.splice(newSelectedItems.indexOf(item), 1);
      setSelectedItems(newSelectedItems);
      onTagsChange && onTagsChange(newSelectedItems);
    };

    const handleInputChange = event => {
      setInputValue(event.target.value);
    };

    const _inputProps = {
      ...InputProps,
      startAdornment: (
        <InputAdornment position={'start'}>
          {selectedItems.map((x, i) => (
            <Chip
              key={i}
              variant={'outlined'}
              tabIndex={-1}
              label={x}
              onDelete={handleDelete(x)}
              color={'primary'}
              size={'small'}
            />
          ))}
        </InputAdornment>
      ),
      // </div>
    };
    return (
      <TextField
        ref={ref}
        variant={variant}
        value={inputValue}
        InputProps={_inputProps}
        onKeyDown={handleKeyDown}
        onChange={event => {
          handleInputChange(event);
        }}
        placeholder={selectedItems.length ? undefined : placeholder}
        {...rest}
      />
    );
  }
);

export default TagsInput;

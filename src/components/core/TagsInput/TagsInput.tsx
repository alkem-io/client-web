import { Chip, createStyles, makeStyles, OutlinedTextFieldProps, TextField, Theme } from '@material-ui/core';
import clsx from 'clsx';
import React, { FC, forwardRef, useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      flexDirection: 'row',
    },
    inputRoot: {
      flexWrap: 'wrap',
      '$hasPopupIcon &, $hasClearIcon &': {
        paddingRight: 26 + 4,
      },
      '$hasPopupIcon$hasClearIcon &': {
        paddingRight: 52 + 4,
      },
      '& $input': {
        width: 0,
        minWidth: 30,
      },
      '&[class*="MuiInput-root"]': {
        paddingBottom: 1,
        '& $input': {
          padding: 4,
        },
        '& $input:first-child': {
          padding: '6px 0',
        },
      },
      '&[class*="MuiInput-root"][class*="MuiInput-marginDense"]': {
        '& $input': {
          padding: '4px 4px 5px',
        },
        '& $input:first-child': {
          padding: '3px 0 6px',
        },
      },
      '&[class*="MuiOutlinedInput-root"]': {
        padding: 9,
        '$hasPopupIcon &, $hasClearIcon &': {
          paddingRight: 26 + 4 + 9,
        },
        '$hasPopupIcon$hasClearIcon &': {
          paddingRight: 52 + 4 + 9,
        },
        '& $input': {
          padding: '9.5px 4px',
        },
        '& $input:first-child': {
          paddingLeft: 6,
        },
        '& $endAdornment': {
          right: 9,
        },
      },
      '&[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]': {
        padding: 6,
        '& $input': {
          padding: '4.5px 4px',
        },
      },
      '&[class*="MuiFilledInput-root"]': {
        paddingTop: 19,
        paddingLeft: 8,
        '$hasPopupIcon &, $hasClearIcon &': {
          paddingRight: 26 + 4 + 9,
        },
        '$hasPopupIcon$hasClearIcon &': {
          paddingRight: 52 + 4 + 9,
        },
        '& $input': {
          padding: '9px 4px',
        },
        '& $endAdornment': {
          right: 9,
        },
      },
      '&[class*="MuiFilledInput-root"][class*="MuiFilledInput-marginDense"]': {
        paddingBottom: 1,
        '& $input': {
          padding: '4.5px 4px',
        },
      },
    },
    input: {
      flexGrow: 1,
      textOverflow: 'ellipsis',
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  })
);

type TagsInputProps = Omit<OutlinedTextFieldProps, 'onChange'> & {
  onChange?: (tags: string[]) => void;
  onAdd?: (item: string) => void;
  onDelete?: (item: string) => void;
  value: string[];
  allowDuplicates?: boolean;
};

export const TagsInput: FC<TagsInputProps> = forwardRef(
  (
    {
      allowDuplicates = false,
      InputProps,
      variant = 'outlined',
      onChange,
      onAdd,
      onDelete,
      value,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const classes = useStyles();
    const [inputValue, setInputValue] = React.useState('');
    const [chips, setChips] = useState<string[]>([]);

    useEffect(() => {
      setChips(value);
    }, [value]);

    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        if (!event.target.value.replace(/\s/g, '').length) return;
        const newChip = event.target.value.trim();
        setInputValue('');

        if (allowDuplicates || chips.indexOf(newChip) === -1)
          if (value && onAdd) {
            onAdd(event.target.value.trim());
          } else {
            const newSelectedItems = [...chips];

            newSelectedItems.push();
            setChips(newSelectedItems);

            onChange && onChange(newSelectedItems);
          }
      }

      if (chips && chips.length && !inputValue.length && event.key === 'Backspace') {
        if (!value) {
          const newSelectedItems = chips.slice(0, chips.length - 1);
          setChips(newSelectedItems);
          onChange && onChange(newSelectedItems);
        } else {
          const itemToDelete = value[value.length - 1];
          if (itemToDelete && onDelete) onDelete(itemToDelete);
        }
      }
    };

    const handleDelete = item => () => {
      if (value && onDelete) {
        onDelete(item);
      } else {
        const newSelectedItems = [...chips];
        newSelectedItems.splice(newSelectedItems.indexOf(item), 1);
        setChips(newSelectedItems);
        onChange && onChange(newSelectedItems);
      }
    };

    const handleInputChange = event => {
      setInputValue(event.target.value);
    };

    const _inputProps = {
      className: classes.inputRoot,
      inputProps: {
        className: clsx(classes.input),
      },
      ...InputProps,
      startAdornment: chips.map((x, i) => (
        <Chip
          key={i}
          variant={'outlined'}
          tabIndex={-1}
          label={x}
          onDelete={handleDelete(x)}
          color={'primary'}
          size={'small'}
          className={classes.chip}
        />
      )),
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
        placeholder={chips.length ? undefined : placeholder}
        {...rest}
      />
    );
  }
);

export default TagsInput;

import React, { useEffect, useRef, useState, FC } from 'react';
import clsx from 'clsx';

import Typography from '../../components/core/Typography';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';

import { ReactComponent as SearchIcon } from 'bootstrap-icons/icons/search.svg';
import { createStyles } from '../../hooks/useTheme';

const useMultipleSelectStyles = createStyles(theme => {
  const element = {
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    margin: '0 10px 0 0',
    borderRadius: `${theme.shape.spacing(5)}px`,
    flexShrink: 0,
    overflowX: 'auto',
    transition: 'background-color 0.25s',
    textTransform: 'uppercase',
  };

  return {
    groupContainer: {
      position: 'relative',
      marginTop: -3,
    },
    label: {
      width: '100%',
      position: 'relative',
      fontSize: '0.9vw',
      whiteSpace: 'nowrap',
      color: theme.palette.neutral,
    },
    selectContainer: {
      position: 'relative',
      height: `${theme.shape.spacing(6)}px`,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box',
      padding: `${theme.shape.spacing(1)}px`,
      overflowX: 'auto',
      overflowY: 'hidden',
      backgroundColor: `${theme.palette.background}`,
      color: `${theme.palette.neutral}`,
      transition: 'border-color 0.3s, box-shadow 0.3s',
      scrollbarColor: `${theme.palette.primary} ${theme.palette.background}`,
      scrollbarWidth: 'thin',
      border: `1px solid ${theme.palette.neutralMedium}`,
      borderRadius: `${theme.shape.spacing(5)}px`,
      '&:hover, &:active ': {
        boxShadow: '0 0 0 0.2rem #007bff25',
        borderColor: `${theme.palette.primary}`,
        cursor: 'pointer',
      },
      '&::-webkit-scrollbar': {
        height: 6,
        marginLeft: `${theme.shape.spacing(2)}px`,
      },
      /* Track */
      '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 5px grey',
        backgroundColor: theme.palette.background,
      },

      /* Handle */
      '&::-webkit-scrollbar-thumb': {
        background: `${theme.palette.primary}`,
      },
      /* Handle on hover */
      '&::-webkit-scrollbar-thumb:hover': {
        background: `${theme.palette.positive}`,
      },
      '&::-webkit-scrollbar-button': {
        backgroundColor: 'transparent',
      },
    },
    elements: {
      display: 'flex',
      boxSizing: 'border-box',
    },
    selectedElement: {
      ...element,
      padding: '11px 16px 11px 24px',
      backgroundColor: `${theme.palette.primary}`,
      lineHeight: '18px',
      '&:hover': {
        cursor: 'default',
        backgroundColor: `${theme.palette.positive}`,
      },
      '& > span': {
        fontWeight: 600,
      },
    },
    removeIcon: {
      flexShrink: 0,
      color: `${theme.palette.neutral}`,
      marginLeft: `${theme.shape.spacing(1)}px`,
      '&:hover': {
        color: `${theme.palette.negative}`,
        cursor: 'pointer',
      },
    },
    flexCenterContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    searchButton: {
      padding: '10px',
    },
    suggestionsTitle: {
      marginTop: `${theme.shape.spacing(3)}px`,
      marginBottom: `${theme.shape.spacing(2)}px`,
      textTransform: 'uppercase',
    },
    suggestions: {
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    },
    suggestionElement: {
      ...element,
      padding: '11px 24px',
      backgroundColor: `${theme.palette.neutralMedium}`,
      flexShrink: 0,
      overflowX: 'auto',
      marginBottom: `${theme.shape.spacing(1)}px`,
      '&:hover': {
        cursor: 'pointer',
        backgroundColor: `${theme.palette.primary}`,
      },
    },
    input: {
      width: 275,
      border: 'none',
      height: 35,
      padding: '0 15px',
      fontSize: 16,
      '&:focus': {
        outline: 'none',
      },
      '&::placeholder': {
        fontSize: 24,
      },
    },
    disabled: {
      color: '#616161',
      '&:hover': {
        cursor: 'not-allowed',
        backgroundColor: '#fff',
      },
    },
  };
});

interface Element {
  name: string;
  id?: string | number;
}

interface MultipleSelectProps {
  elements: Array<Element>;
  onChange: (elements: Array<Element>) => void;
  onInput: (value: string) => void;
  onSearch: () => void;
  allowUnknownValues?: boolean;
  defaultValue?: Array<Element>;
  disabled?: boolean;
  label?: string;
  onTop?: boolean;
  height?: number;
}

const MultipleSelect: FC<MultipleSelectProps> = ({
  elements: _elements,
  onChange,
  onInput,
  onSearch,
  allowUnknownValues,
  defaultValue,
  disabled,
}) => {
  const select = useRef<HTMLDivElement>(document.createElement('div'));
  const input = useRef<HTMLInputElement>(document.createElement('input'));
  const [elements, setElements] = useState<Array<Element>>(_elements || []);
  const [elementsNoFilter, setElementsNoFilter] = useState<Array<Element>>(_elements || []);
  const [selectedElements, setSelected] = useState<Array<Element>>(defaultValue || []);
  const [isNoMatches, setNoMatches] = useState<boolean>(false);
  const styles = useMultipleSelectStyles();

  useEffect(() => setElements(_elements), [_elements]);
  useEffect(() => {
    if (defaultValue && defaultValue.length > 0) {
      setSelected(defaultValue);
    }
  }, [defaultValue]);

  const resetInput = (): void => {
    input.current.value = '';
  };

  const handleSelect = (e, value: { name }) => {
    const isAlreadySelected = selectedElements.find(el => el.name === value.name);
    if (isAlreadySelected) return;

    const newSelected = [...selectedElements, { name: value.name }];
    const newElements = elementsNoFilter.filter(el => el.name !== value.name);

    resetInput();
    setSelected(newSelected);
    setElements(newElements);
    setElementsNoFilter(newElements);
    onChange(newSelected);
    onInput('');
    // onSearch();
  };

  const handleRemove = (e, value) => {
    const newSelected = selectedElements.filter(el => el.name !== value.name);
    const newElements = [...elements, { name: value.name }];

    setSelected(newSelected);
    setElements(newElements);
    setElementsNoFilter(newElements);
    onChange(newSelected);
    onSearch();
  };

  const handleInputChange = e => {
    const value = e.target.value.toLowerCase();
    onInput(value);
    if (allowUnknownValues && e.key === 'Enter' && value !== '') {
      const isAlreadySelected = selectedElements.find(el => el.name === value);
      if (isAlreadySelected) return;

      const newElements = elementsNoFilter.filter(el => el.name !== value);

      resetInput();
      // setElements(newElements);
      setElementsNoFilter(newElements);
      setSelected([...selectedElements, { name: value }]);
      setNoMatches(false);
      onChange([...selectedElements, { name: value }]);
      onSearch();
      onInput('');
    }
  };

  return (
    <>
      <div className={styles.groupContainer}>
        <div
          ref={select}
          id={'selectContainer'}
          className={clsx(styles.selectContainer, disabled && styles.disabled)}
          onClick={() => input.current.focus()}
        >
          <section className={styles.flexCenterContainer}>
            <IconButton onClick={onSearch} className={styles.searchButton}>
              <Icon component={SearchIcon} color="inherit" size={'sm'} />
            </IconButton>
            <input
              ref={input}
              className={styles.input}
              onChange={handleInputChange}
              onKeyDown={handleInputChange}
              placeholder={'Search people, groups or skills'}
            />
          </section>
          <div className={styles.elements}>
            {selectedElements.map((selectedEl, index) => (
              <div
                key={`${selectedEl.name}${index}`}
                className={clsx(styles.selectedElement, disabled && styles.disabled)}
              >
                <Typography as={'span'} weight={'boldLight'} color={'background'}>
                  {selectedEl.name}
                </Typography>
                {!disabled && (
                  <div className={styles.removeIcon} onClick={e => handleRemove(e, selectedEl)}>
                    <Typography weight={'boldLight'}>X</Typography>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Typography color={'neutralMedium'} className={styles.suggestionsTitle}>
          {isNoMatches ? 'no suggestions' : 'search suggestions'}
        </Typography>

        <div className={styles.suggestions}>
          {elements.map((el, index) => {
            return (
              <div key={index} className={styles.suggestionElement} onClick={e => handleSelect(e, el)}>
                <Typography as={'span'} weight={'boldLight'} color={'background'}>
                  {el.name}
                </Typography>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MultipleSelect;

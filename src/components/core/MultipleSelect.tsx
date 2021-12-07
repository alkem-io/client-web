import React, { useEffect, useRef, useState, FC } from 'react';
import clsx from 'clsx';

import Typography from '../../components/core/Typography';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';

import { ReactComponent as SearchIcon } from 'bootstrap-icons/icons/search.svg';
import { makeStyles } from '@mui/styles';
import Tooltip from '@mui/material/Tooltip';

const useMultipleSelectStyles = makeStyles(theme => ({
  groupContainer: {
    position: 'relative',
    marginTop: -3,
  },
  label: {
    width: '100%',
    position: 'relative',
    fontSize: '0.9vw',
    whiteSpace: 'nowrap',
    color: theme.palette.neutral.main,
  },
  selectContainer: {
    position: 'relative',
    height: theme.spacing(6),
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
    padding: theme.spacing(1),
    overflowX: 'auto',
    overflowY: 'hidden',
    backgroundColor: `${theme.palette.background.paper}`,
    color: `${theme.palette.neutral.main}`,
    transition: 'border-color 0.3s, box-shadow 0.3s',
    scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
    scrollbarWidth: 'thin',
    border: `1px solid ${theme.palette.neutralMedium.main}`,
    borderRadius: theme.spacing(5),
    '&:hover, &:active ': {
      boxShadow: '0 0 0 0.2rem #007bff25',
      borderColor: `${theme.palette.primary.main}`,
      cursor: 'pointer',
    },
    '&::-webkit-scrollbar': {
      height: 6,
      marginLeft: theme.spacing(2),
    },
    /* Track */
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 5px #c3c3c3',
      backgroundColor: theme.palette.background.paper,
    },

    /* Handle */
    '&::-webkit-scrollbar-thumb': {
      background: `${theme.palette.primary.main}`,
    },
    /* Handle on hover */
    '&::-webkit-scrollbar-thumb:hover': {
      background: `${theme.palette.positive.main}`,
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
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    margin: '0 10px 0 0',
    borderRadius: theme.spacing(5),
    flexShrink: 0,
    overflowX: 'auto',
    transition: 'background-color 0.25s',
    textTransform: 'uppercase',
    '& > span': {
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Montserrat, sans-serif',
    },
    padding: '11px 16px 11px 24px',
    backgroundColor: `${theme.palette.primary.main}`,
    lineHeight: '18px',
    '&:hover': {
      cursor: 'default',
      backgroundColor: `${theme.palette.positive.main}`,
    },
  },
  removeIcon: {
    flexShrink: 0,
    color: `${theme.palette.neutral.main}`,
    marginLeft: theme.spacing(1),
    '&:hover': {
      color: `${theme.palette.negative.main}`,
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
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    textTransform: 'uppercase',
  },
  suggestions: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
  },
  suggestionElement: {
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    margin: '0 10px 0 0',
    borderRadius: theme.spacing(5),
    flexShrink: 0,
    overflowX: 'auto',
    transition: 'background-color 0.25s',
    textTransform: 'uppercase',
    '& > span': {
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Montserrat, sans-serif',
    },
    padding: '11px 24px',
    backgroundColor: `${theme.palette.neutralMedium.main}`,
    marginBottom: theme.spacing(1),
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${theme.palette.primary.main}`,
    },
  },
  input: {
    width: 320,
    border: 'none',
    height: 35,
    padding: '0 15px',
    fontSize: 16,
    '&:focus': {
      outline: 'none',
    },
    '&::placeholder': {
      fontSize: 20,
    },
    backgroundColor: theme.palette.background.paper,
  },
  disabled: {
    color: '#616161',
    '&:hover': {
      cursor: 'not-allowed',
      backgroundColor: '#fff',
    },
  },
}));

export interface MultiSelectElement {
  name: string;
  id?: string | number;
}

interface MultipleSelectProps {
  elements: Array<MultiSelectElement>;
  onChange?: (elements: Array<MultiSelectElement>) => void;
  onInput?: (value: string) => void;
  onSearch?: () => void;
  allowUnknownValues?: boolean;
  defaultValue?: Array<MultiSelectElement>;
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
  const [elements, setElements] = useState<Array<MultiSelectElement>>(_elements || []);
  const [elementsNoFilter, setElementsNoFilter] = useState<Array<MultiSelectElement>>(_elements || []);
  const [selectedElements, setSelected] = useState<Array<MultiSelectElement>>(defaultValue || []);
  const [isNoMatches, setNoMatches] = useState<boolean>(false);
  const [isTooltipShown, setTooltipShown] = useState<boolean>(false);
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

  const shouldOpenTooltip = (): boolean => {
    if (selectedElements.length >= 5) {
      setTooltipShown(true);
      setTimeout(() => setTooltipShown(false), 5000);

      return true;
    } else {
      setTooltipShown(false);

      return false;
    }
  };

  const handleSelect = (e, value: { name }): void => {
    if (shouldOpenTooltip()) return;

    const isAlreadySelected = selectedElements.find(el => el.name === value.name);
    if (isAlreadySelected) return;

    const newSelected = [...selectedElements, { name: value.name }];
    const newElements = elementsNoFilter.filter(el => el.name !== value.name);

    resetInput();
    setSelected(newSelected);
    setElements(newElements);
    setElementsNoFilter(newElements);
    onChange && onChange(newSelected);
    onInput && onInput('');
  };

  const handleRemove = (e, value) => {
    const newSelected = selectedElements.filter(el => el.name !== value.name);
    const newElements = [...elements, { name: value.name }];

    setTooltipShown(false);
    setSelected(newSelected);
    setElements(newElements);
    setElementsNoFilter(newElements);
    onChange && onChange(newSelected);
  };

  const handleInputChange = e => {
    const value = e.target.value.toLowerCase();
    onInput && onInput(value);
    if (allowUnknownValues && e.key === 'Enter' && value !== '') {
      if (shouldOpenTooltip()) return;

      const isAlreadySelected = selectedElements.find(el => el.name === value);
      if (isAlreadySelected) return;

      const newElements = elementsNoFilter.filter(el => el.name !== value);

      resetInput();
      setElementsNoFilter(newElements);
      setSelected([...selectedElements, { name: value }]);
      setNoMatches(false);
      onChange && onChange([...selectedElements, { name: value }]);
      onSearch && onSearch();
      onInput && onInput('');
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
            <IconButton onClick={onSearch} className={styles.searchButton} size="large">
              <Icon component={SearchIcon} color="inherit" size={'sm'} />
            </IconButton>
            <Tooltip id="overlay-example" title={'You have reached the tags limit of 5'} open={isTooltipShown}>
              <input
                ref={input}
                className={styles.input}
                onChange={handleInputChange}
                onKeyDown={handleInputChange}
                placeholder={'Search people, groups or skills'}
              />
            </Tooltip>
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

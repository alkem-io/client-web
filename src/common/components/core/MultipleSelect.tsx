import React, { useEffect, useRef, useState, FC } from 'react';
import clsx from 'clsx';
import SearchIcon from '@mui/icons-material/Search';
import { makeStyles } from '@mui/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Box, { BoxProps } from '@mui/material/Box';

import WrapperTypography from './WrapperTypography';
import { uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

const useMultipleSelectStyles = makeStyles(theme => ({
  groupContainer: {
    position: 'relative',
    marginTop: -3,
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
    flexWrap: 'wrap',
    [theme.breakpoints.up('lg')]: {
      flexWrap: 'nowrap',
    },
  },
  selectedElement: {
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    margin: '1px 10px 1px 0',
    borderRadius: theme.spacing(5),
    flexShrink: 0,
    overflowX: 'auto',
    transition: 'background-color 0.25s',
    whiteSpace: 'nowrap',
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
    flex: 1,
  },
  searchButton: {
    flex: 0,
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
    justifyContent: 'space-around',
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
    width: '90%',
    [theme.breakpoints.up('md')]: {
      width: 320,
    },
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
  onTop?: boolean;
  height?: number;
  minLength?: number;
}

const filterEmptyValues = (values: MultiSelectElement[] | undefined) => {
  const filtered =
    values
      ?.map(item => ({ name: item?.name?.trim(), id: item?.id }))
      .filter(item => item && item.name && item.name.length > 0) || [];
  return uniqBy(filtered, item => item.name);
};

interface SelectedElementsProps {
  selectedElements: MultiSelectElement[];
  disabled?: boolean;
  handleRemove: (e: React.MouseEvent, selectedElement: MultiSelectElement) => void;
  sx: BoxProps['sx'];
}

const SelectedElements: FC<SelectedElementsProps> = ({ selectedElements, sx, disabled, handleRemove }) => {
  const styles = useMultipleSelectStyles();
  return (
    <Box flex={0} sx={sx}>
      <Box className={styles.elements}>
        {selectedElements.map((selectedEl, index) => (
          <div key={`${selectedEl.name}${index}`} className={clsx(styles.selectedElement, disabled && styles.disabled)}>
            <WrapperTypography as={'span'} weight={'boldLight'} color={'background'}>
              {selectedEl.name}
            </WrapperTypography>
            {!disabled && (
              <div className={styles.removeIcon} onClick={e => handleRemove(e, selectedEl)}>
                <WrapperTypography weight={'boldLight'}>X</WrapperTypography>
              </div>
            )}
          </div>
        ))}
      </Box>
    </Box>
  );
};

const MultipleSelect: FC<MultipleSelectProps> = ({
  elements: _elements,
  onChange,
  onInput,
  onSearch,
  allowUnknownValues,
  defaultValue,
  disabled,
  minLength = 2,
}) => {
  const { t } = useTranslation();
  const select = useRef<HTMLDivElement>(document.createElement('div'));
  const input = useRef<HTMLInputElement>(document.createElement('input'));
  const [elements, setElements] = useState<Array<MultiSelectElement>>(_elements || []);
  const [elementsNoFilter, setElementsNoFilter] = useState<Array<MultiSelectElement>>(_elements || []);
  const [selectedElements, setSelected] = useState<Array<MultiSelectElement>>(filterEmptyValues(defaultValue));
  const [isNoMatches, setNoMatches] = useState<boolean>(false);
  const [isTooltipShown, setTooltipShown] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState(disabled ?? true);
  const styles = useMultipleSelectStyles();

  useEffect(() => setElements(_elements), [_elements]);
  useEffect(() => {
    if (defaultValue && defaultValue.length > 0) {
      setSelected(filterEmptyValues(defaultValue));
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

    const isEmpty = value.name.trim().length === 0;
    if (isEmpty) return;

    const newSelected = filterEmptyValues([...selectedElements, { name: value.name }]);
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

  const handleSearch = (value?: string) => {
    value = value ?? input.current.value;

    if (!value || value.trim().length === 0) {
      return;
    }

    if (shouldOpenTooltip()) return;

    const isAlreadySelected = selectedElements.find(el => el.name === value);
    if (isAlreadySelected) return;

    const newElements = elementsNoFilter.filter(el => el.name !== value);
    const newSelected = filterEmptyValues([...selectedElements, { name: value }]);

    resetInput();
    setElementsNoFilter(newElements);
    setSelected(newSelected);
    setNoMatches(false);
    onChange && onChange(newSelected);
    onSearch && onSearch();
    onInput && onInput('');
  };

  const handleInputChange = e => {
    const value = e.target.value.toLowerCase();
    onInput && onInput(value);
    setIsDisabled(value.length < minLength);
    if (allowUnknownValues && e.key === 'Enter' && value.length >= minLength) {
      handleSearch(value);
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
          <SelectedElements
            selectedElements={selectedElements}
            disabled={disabled}
            handleRemove={handleRemove}
            sx={{ display: { xs: 'none', lg: 'block' } }}
          />
          <IconButton onClick={() => handleSearch()} disabled={isDisabled} className={styles.searchButton}>
            <SearchIcon color="primary" />
          </IconButton>
        </div>
        <SelectedElements
          selectedElements={selectedElements}
          disabled={disabled}
          handleRemove={handleRemove}
          sx={{ marginTop: theme => theme.spacing(2), display: { xs: 'block', lg: 'none' } }}
        />
        <WrapperTypography color={'neutralMedium'} className={styles.suggestionsTitle}>
          {isNoMatches ? t('pages.search.no-suggestions') : t('pages.search.search-suggestions')}
        </WrapperTypography>

        <div className={styles.suggestions}>
          {elements.map((el, index) => {
            return (
              <div key={index} className={styles.suggestionElement} onClick={e => handleSelect(e, el)}>
                <WrapperTypography as={'span'} weight={'boldLight'} color={'background'}>
                  {el.name}
                </WrapperTypography>
              </div>
            );
          })}
          <Box flex={1} />
        </div>
      </div>
    </>
  );
};

export default MultipleSelect;

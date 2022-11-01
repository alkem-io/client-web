import clsx from 'clsx';
import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  BoxProps,
  FormControl,
  FormGroup,
  FormHelperText,
  InputLabel,
  InputLabelProps,
  InputProps,
  Skeleton,
  styled,
} from '@mui/material';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useField } from 'formik';
import { makeStyles } from '@mui/styles';
import CharacterCounter from '../common/CharacterCounter/CharacterCounter';
import { markdownToDraft, draftToMarkdown } from './tools/markdown-draft-js';
import hexToRGBA from '../../../utils/hexToRGBA';
import { useTranslation } from 'react-i18next';

const useStyle = makeStyles(theme => ({
  toolbar: {
    width: '100%',
    padding: theme.spacing(2, 0.5, 1, 0.5),
    '& .rdw-option-wrapper': {
      height: theme.spacing(4),
      width: theme.spacing(4),
    },
    '& .rdw-dropdown-wrapper': {
      height: theme.spacing(4),
    },
    // Links target not supported by Markdown
    '& .rdw-link-modal-target-option': {
      display: 'none',
    },
    // Image size is not supported by Markdown
    '& .rdw-image-modal-size': {
      display: 'none',
    },
    '& .rdw-emoji-modal': {
      width: 290,
    },
    '& .rdw-emoji-icon': {
      fontSize: '24px',
      margin: 4,
    },
  },
  editor: {
    width: '100%',
    maxWidth: '100%',
    padding: theme.spacing(0, 2),
    minHeight: theme.spacing(25),
    '& > div': {
      marginTop: theme.spacing(-2),
    },
  },
}));

/**
 * Outlined field styles.
 * This makes that nice effect of the label moving up in an animation on focus
 */
interface FieldContainerProps extends BoxProps {
  isFocused: boolean;
}
// TODO: Read these styles from somewhere else? How can I check if the TextInputs for example have rounded corners in the theme
const FieldContainer = styled(({ isFocused, ...rest }: FieldContainerProps) => <Box {...rest} />)`
  position: relative;
  border-style: solid;
  border-radius: ${props => props.theme.spacing(0.5)};
  border-color: ${props => (props.isFocused ? props.theme.palette.primary.main : props.theme.palette.grey[400])};
  border-width: ${props => (props.isFocused ? '2px' : '1px')};
  margin: ${props => (props.isFocused ? '-1px' : '0')};

  & .MuiInputLabel-root.MuiInputLabel-outlined.MuiFormLabel-root {
    padding: ${props => props.theme.spacing(0, 1)};
    transform: translate(8px, 66px) scale(1);
  }
  & .MuiInputLabel-root.MuiInputLabel-outlined.MuiFormLabel-root.MuiInputLabel-shrink {
    color: ${props => (props.isFocused ? props.theme.palette.primary.main : props.theme.palette.grey[800])};
    background: ${props => props.theme.palette.common.white};
    transform: translate(14px, -9px) scale(0.75);
  }
`;

const DisabledOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: hexToRGBA(theme.palette.grey[400], 0.2),
  zIndex: 1,
}));
const LoadingOverlay = styled(Skeleton)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  transform: 'none',
  zIndex: 1,
}));

// Image uploading
// TODO: Handle image upload
const handleImageUpload = () => {
  let promise = new Promise(function (resolve, _reject) {
    setTimeout(() => {
      resolve({ data: { link: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' } });
    }, 1000);
  });
  return promise;
};

// Editor Toolbar:
// https://jpuri.github.io/react-draft-wysiwyg/#/docs
const toolbar = {
  options: ['inline', 'blockType', 'list', 'link', 'emoji', 'image'],
  blockType: {
    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
  },
  inline: {
    // Markdown doesn't support 'underline', strikethrough removed
    options: ['bold', 'italic'],
  },
  list: {
    options: ['unordered', 'ordered'],
  },
  link: {
    showOpenOptionOnHover: true,
    options: ['link'],
  },
  emoji: {},
  image: {
    urlEnabled: true,
    uploadEnabled: true,
    alignmentEnabled: false,
    uploadCallback: handleImageUpload,
    previewImage: true,
    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    alt: { present: false, mandatory: false },
    defaultSize: false,
  },
};

const toolbarTranslationKeys = [
  'blocktype.h1',
  'blocktype.h2',
  'blocktype.h3',
  'blocktype.h4',
  'blocktype.h5',
  'blocktype.h6',
  'blocktype.blockquote',
  'blocktype.code',
  'blocktype.blocktype',
  'blocktype.normal',
  'emoji.emoji',
  'history.history',
  'history.undo',
  'history.redo',
  'image.image',
  'image.fileUpload',
  'image.byURL',
  'image.dropFileText',
  'inline.bold',
  'inline.italic',
  'inline.strikethrough',
  'inline.monospace',
  'link.linkTitle',
  'link.linkTarget',
  'link.linkTargetOption',
  'link.link',
  'link.unlink',
  'list.list',
  'list.unordered',
  'list.ordered',
  'list.indent',
  'list.outdent',
  'remove.remove',
] as const;

interface MarkdownFieldProps extends InputProps {
  title?: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  withCounter?: boolean;
  helperText?: string;
  loading?: boolean;
  inputLabelComponent?: ComponentType<InputLabelProps>;
}

export const FormikMarkdownField: FC<MarkdownFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  maxLength,
  withCounter = false,
  helperText: _helperText,
  loading,
  inputLabelComponent: InputLabelComponent = InputLabel,
}) => {
  const { t, i18n } = useTranslation();
  const styles = useStyle();
  const [field, meta, helper] = useField(name);
  const isError = Boolean(meta.error) && meta.touched;
  const editorRef = useRef<HTMLElement>();

  // TODO: Check if these are still working:
  const validClass = useMemo(() => (!isError && meta.touched ? 'is-valid' : undefined), [meta, isError]);
  const invalidClass = useMemo(
    () => (required && isError && meta.touched ? 'is-invalid' : undefined),
    [meta, required, isError]
  );
  const helperText = useMemo(() => {
    if (!isError) {
      return _helperText;
    }

    return meta.error;
  }, [isError, meta.error, _helperText]);

  // Handle editor state and sync with formik field:
  const [editorState, setEditorState] = useState(() => {
    return EditorState.createWithContent(convertFromRaw(markdownToDraft(field.value)));
  });

  useEffect(() => {
    setEditorState(EditorState.createWithContent(convertFromRaw(markdownToDraft(meta.initialValue))));
  }, [meta.initialValue]);

  const onEditorStateChange = newEditorState => {
    setEditorState(newEditorState);
    const currentMd = draftToMarkdown(convertToRaw(newEditorState.getCurrentContent()), {});
    helper.setValue(currentMd);
  };

  // Toolbar translations:
  // See https://jpuri.github.io/react-draft-wysiwyg/#/docs
  // And https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/i18n/en.js
  const toolbarTranslations = useMemo(() => {
    const initialValue = {};
    const toolbarTranslated = toolbarTranslationKeys.reduce((obj, item) => {
      return {
        ...obj,
        [`components.controls.${item}`]: t(`common.wysiwyg-editor.toolbar.${item}` as const),
      };
    }, initialValue);

    return {
      ...toolbarTranslated,
      'generic.add': t('common.wysiwyg-editor.generic.add'),
      'generic.cancel': t('common.wysiwyg-editor.generic.cancel'),
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);

  // TODO: implement maxLength
  // https://github.com/facebook/draft-js/issues/119
  // https://github.com/jpuri/react-draft-wysiwyg/issues/782

  const [isFocused, setFocus] = useState(false);
  const handleOnFocus = () => {
    setFocus(true);
  };

  const handleOnBlur = _evt => {
    setFocus(false);
    // TODO: This gives a Warning, and I don't know why
    // It's useful to call onBlur to trigger field validation
    //field.onBlur(evt);
  };

  return (
    <FormGroup>
      <FormControl required={required} disabled={disabled} variant="outlined" fullWidth>
        <FieldContainer isFocused={isFocused}>
          {title && (
            <InputLabelComponent required={required} shrink={isFocused || !!field.value}>
              {title}
            </InputLabelComponent>
          )}
          <Editor
            wrapperId={`markdown-${name}`}
            editorRef={ref => (editorRef.current = ref as HTMLElement)}
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
            toolbarClassName={styles.toolbar}
            editorClassName={clsx('form-control', styles.editor, validClass, invalidClass)}
            placeholder={!title ? placeholder : undefined}
            readOnly={readOnly || disabled}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            toolbar={toolbar}
            localization={{
              translations: toolbarTranslations,
            }}
          />
          {disabled && <DisabledOverlay />}
          {loading && <LoadingOverlay />}
        </FieldContainer>
      </FormControl>
      {withCounter && <CharacterCounter count={field.value?.length} maxLength={maxLength} />}
      <FormHelperText sx={{ width: '95%' }} error={isError}>
        {helperText}
      </FormHelperText>
    </FormGroup>
  );
};

export default FormikMarkdownField;

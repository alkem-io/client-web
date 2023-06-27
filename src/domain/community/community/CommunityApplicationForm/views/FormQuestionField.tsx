import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tooltip } from '@mui/material';
import * as yup from 'yup';
import { gutters } from '../../../../../core/ui/grid/utils';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikCheckboxField from '../../../../../common/components/composite/forms/FormikCheckboxField';
import RoundedBadge from '../../../../../core/ui/icon/RoundedBadge';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowDownwardIcon from '@mui/icons-material/KeyboardArrowDown';
import { MID_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';

interface FormQuestionFieldProps {
  index: number;
  onDelete: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  canMoveUp?: boolean;
  onMoveUpClick?: () => void;
  canMoveDown?: boolean;
  onMoveDownClick?: () => void;
}

export const questionSchema = yup.object().shape({
  question: yup.string().required().max(MID_TEXT_LENGTH),
  explanation: yup.string(),
  required: yup.boolean().required(),
});

const FormQuestionField: FC<FormQuestionFieldProps> = ({
  index,
  onDelete,
  canMoveUp,
  onMoveUpClick,
  canMoveDown,
  onMoveDownClick,
  disabled,
  readOnly,
}) => {
  const { t } = useTranslation();
  return (
    <Box key={index} display="flex" flexDirection="row" alignItems="center" marginY={gutters(1)} gap={1}>
      <RoundedBadge size="medium" color="background.paper" sx={{ color: theme => theme.palette.primary.main }}>
        {index + 1}
      </RoundedBadge>
      <Box flexGrow={1}>
        <FormikInputField
          name={`questions.${index}.question`}
          title={t('common.question')}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={MID_TEXT_LENGTH}
          withCounter
        />
      </Box>
      <Tooltip title={t('community.application-form.move-up')} placement={'bottom'}>
        <span>
          <IconButton
            onClick={onMoveUpClick}
            disabled={disabled || !canMoveUp || readOnly}
            size="small"
            sx={{ marginRight: -1 }}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('community.application-form.move-down')} placement={'bottom'}>
        <span>
          <IconButton
            onClick={onMoveDownClick}
            disabled={disabled || !canMoveDown || readOnly}
            size="small"
            sx={{ marginLeft: -1, marginRight: -1 }}
          >
            <ArrowDownwardIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={t('community.application-form.delete-question')} placement={'bottom'}>
        <span>
          <IconButton aria-label="Remove" onClick={onDelete} disabled={disabled || readOnly} size="large">
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Box>
        <FormikCheckboxField
          name={`questions.${index}.required`}
          title={t('community.application-form.required-question')}
          disabled={disabled || readOnly}
        />
      </Box>
    </Box>
  );
};

export default FormQuestionField;

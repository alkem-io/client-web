import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from '@mui/material/Skeleton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import HelpButton from '../../components/core/HelpButton';
import { InputAdornment } from '@mui/material';
import { useHub } from '../../hooks';
import FormikSelect from '../../components/composite/forms/FormikSelect';

export interface AspectTypeFormFieldProps {
  name: string;
  value?: string;
}

const AspectTypeFormField: FC<AspectTypeFormFieldProps> = ({ name, value }) => {
  const { t } = useTranslation();
  const { error, loading, template } = useHub();

  if (error) {
    return <Typography>{t('components.aspect-creation.type-step.error')}</Typography>;
  }

  const aspectTypes = template.aspectTemplates.map(x => {
    return { id: x.type, name: x.type };
  });

  return (
    <>
      {loading ? (
        <Skeleton width={'100%'}>
          <Select>
            <MenuItem />
          </Select>
        </Skeleton>
      ) : (
        <FormikSelect
          name={name}
          title={t('aspect-edit.type.title')}
          required
          placeholder={t('components.aspect-creation.info-step.name-help-text')}
          values={aspectTypes}
          endAdornment={
            <InputAdornment position="start">
              <HelpButton
                helpText={
                  template.aspectTemplates.find(x => x.type === value)?.typeDescription ??
                  t('components.aspect-creation.type-step.type-help-text-short')
                }
              />
            </InputAdornment>
          }
        />
      )}
    </>
  );
};
export default AspectTypeFormField;

import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from './CountrySelect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormRow from '@/core/ui/forms/FormRow';

type LocationSegmentProps = {
  cols?: number;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  cityFieldName?: string;
  countryFieldName?: string;
};

export const LocationSegment = (props: PropsWithChildren<LocationSegmentProps>) => {
  const { t } = useTranslation();
  const cols = !props?.cols || props?.cols <= 0 ? 1 : props!.cols,
    disabled = props.disabled || false,
    required = props.required || false,
    readonly = props.readonly || false,
    cityFieldName = props.cityFieldName || 'city',
    countryFieldName = props.countryFieldName || 'country';

  return (
    <>
      <FormRow cols={cols}>
        <CountrySelect
          name={countryFieldName}
          title={t('components.profileSegment.location.country.name')}
          key="name"
          readOnly={readonly}
          disabled={disabled}
          required={required}
        />
      </FormRow>
      <FormRow cols={cols}>
        <FormikInputField
          name={cityFieldName}
          title={t('components.profileSegment.location.city.name')}
          placeholder={t('components.profileSegment.location.city.placeholder')}
          readOnly={readonly}
          disabled={disabled}
          required={required}
        />
        {props.children}
      </FormRow>
    </>
  );
};

// Note: In this file some dates are recreated with
//  `new Date(something that is supposed to be already a Date)`
//  because the API is returning strings parsable as a Dates but not a real Javascript Dates, and
//  Codegen tool wrongly generates models with Date properties.

// TODO: support en-us format mm/dd?? Maybe get this from the browser?
const LocaleId = 'en-GB';

const dayFormatOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export const isSameDay = (startDate: Date | undefined, endDate: number | Date | undefined) => {
  if (!startDate || !endDate) {
    return true;
  }

  const startDateOnly = new Date(startDate).toLocaleDateString(LocaleId, dayFormatOptions);
  const endDateOnly = new Date(endDate).toLocaleDateString(LocaleId, dayFormatOptions);

  return startDateOnly === endDateOnly;
};

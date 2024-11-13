import { TypographyProps } from '@mui/material';
import { PageTitle } from '@core/ui/typography';

interface SubHeadingProps extends TypographyProps {}

const SubHeading = (props: SubHeadingProps) => {
  return <PageTitle {...props} />;
};

export default SubHeading;

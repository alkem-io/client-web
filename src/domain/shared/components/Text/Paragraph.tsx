import { Box, BoxProps } from '@mui/material';

export const LINE_HEIGHT = 4;

interface ParagraphProps extends BoxProps<'p'> {}

const Paragraph = (props: ParagraphProps) => {
  return (
    <Box component="p" fontSize={15} lineHeight={theme => theme.spacing(LINE_HEIGHT / 2)} marginY={2} {...props} />
  );
};

export default Paragraph;

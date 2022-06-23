import * as yup from 'yup';

export const visualSegmentSchema = yup.object().shape({
  avatar: yup.string(),
  background: yup.string(),
  banner: yup.string(),
});

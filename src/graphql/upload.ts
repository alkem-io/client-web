import { gql } from '@apollo/client';

export const UPLOAD_FILE_MUTATION = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file)
  }
`;

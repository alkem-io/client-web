import { gql } from '@apollo/client';

export const AVATAR_FRAGMENT = gql`
  fragment Avatar on Profile {
    id
    avatar
  }
`;

export const UPLOAD_AVATAR_MUTATION = gql`
  mutation uploadAvatar($file: Upload!, $profileId: Float!) {
    uploadAvatar(file: $file, profileID: $profileId) {
      ...Avatar
    }
  }
  ${AVATAR_FRAGMENT}
`;

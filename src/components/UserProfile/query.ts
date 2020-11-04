import { gql } from '@apollo/client';

export const QUERY_USER_PROFILE = gql`
  # Write your query or mutation here
  query {
    me {
      name
      firstName
      lastName
      city
      phone
      gender
      email
      country
      profile {
        avatar
        tagsets {
          name
          tags
        }
        references {
          name
          uri
        }
      }
      memberof {
        groups {
          name
        }
        challenges {
          name
        }
      }
    }
  }
`;

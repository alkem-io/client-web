import gql from 'graphql-tag';

export const QUERY_CHALLENGES_LIST = gql`
    query challengeList {
        challenges {
            name         
        }
    }
`;
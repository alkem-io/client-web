import gql from 'graphql-tag';

export const QUERY_CHALLENGES_LIST = gql`
    query challengeList {
        challenges {
            id
            name  
            context {
                description
            }       
        }
    }
`;
import gql from 'graphql-tag';

export const QUERY_CHALLENGES_LIST = gql`
    query challengeList {
        allChallenges {
            name
            description 
            tags {
                name
            }
            
        }
    }
`;
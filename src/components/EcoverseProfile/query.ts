import gql from 'graphql-tag';

export const QUERY_ECOVERSES_LIST = gql`
    query ecoverseList {
        allEcoverse {
            name
        }
    }
`;
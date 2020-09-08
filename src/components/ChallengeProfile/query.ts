import gql from 'graphql-tag';

export const QUERY_CHALLENGE_PROFILE = gql`
    query challengeProfile($id: String!) {
        challenge(ID: $id) {
            id
            name
            context {
                tagline
                background
                vision
                impact
                who
                references {
                    name
                    uri
                    description
                }
            }
            tags {
                name
            }
        }
        
    }
`;
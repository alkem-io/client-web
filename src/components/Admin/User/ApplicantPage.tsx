import { gql } from '@apollo/client';
import generator from 'generate-password';
import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import UserForm from './UserForm';
import { useCreateUserMutation, UserInput } from '../../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../../graphql/user';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { UserModel } from '../../../models/User';
import { PageProps } from '../../../pages';
import { EditMode } from '../../../utils/editMode';

interface UserPageProps extends PageProps {
  user?: UserModel;
  mode: EditMode;
  title?: string;
}

export const ApplicantPage: FC<UserPageProps> = ({ paths }) => {
  const { applicantId } = useParams<{ applicantId: string }>();
  console.log('applicantId ---> ', applicantId);
  const currentPaths = useMemo(() => [...paths, { name: 'applicant', real: false }], [paths]);

  useUpdateNavigation({ currentPaths });

  const [createUser] = useCreateUserMutation({
    update: (cache, { data }) => {
      if (data) {
        const { createUser } = data;

        cache.modify({
          fields: {
            users(existingUsers = []) {
              const newUserRef = cache.writeFragment({
                data: createUser,
                fragment: gql`
                  ${USER_DETAILS_FRAGMENT}
                `,
              });
              return [...existingUsers, newUserRef];
            },
          },
        });
      }
    },
  });

  const handleSave = (user: UserModel) => {
    // Convert UserModel to UserInput
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: userID, memberof, profile, ...rest } = user;
    const userInput: UserInput = {
      ...rest,
      profileData: {
        avatar: profile.avatar,
        description: profile.description,
        referencesData: [...profile.references],
        tagsetsData: [...profile.tagsets],
      },
    };

    const passwordBase = generator.generate({
      length: 4,
      numbers: true,
      symbols: false,
      excludeSimilarCharacters: true,
      exclude: '"', // avoid causing invalid Json
      strict: true,
    });
    const aadPassword = `Cherrytwist-${passwordBase}!`;

    userInput.aadPassword = aadPassword;

    // setPassword(aadPassword);
    createUser({
      variables: {
        user: userInput,
      },
    });
  };

  return <UserForm editMode={EditMode.readOnly} onSave={handleSave} title={'title'} />;
};
export default ApplicantPage;

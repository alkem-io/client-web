import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Tagset, UpdateVirtualContributorInput, Visual } from '@/core/apollo/generated/graphql-schema';
import { NameSegment, nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { ProfileSegment, profileSegmentSchema } from '@/domain/platform/admin/components/Common/ProfileSegment';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import Gutters from '@/core/ui/grid/Gutters';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { Actions } from '@/core/ui/actions/Actions';
import { TagsetSegment } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { UpdateTagset } from '@/domain/common/profile/Profile';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { theme } from '@/core/ui/themes/default/Theme';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridProvider from '@/core/ui/grid/GridProvider';
import GridItem from '@/core/ui/grid/GridItem';
import { BasicSpaceProps } from '../../virtualContributor/components/BasicSpaceCard';
import { useColumns } from '@/core/ui/grid/GridContext';
import { Reference } from '@/domain/common/profile/Profile';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { KEYWORDS_TAGSET } from '@/domain/common/tags/tagset.constants';
import ProfileReferenceSegment from '@/domain/platform/admin/components/Common/ProfileReferenceSegment';

type VirtualContributorProps = {
  id: string;
  nameID: string;
  account?: {
    host?: {
      profile: {
        displayName: string;
      };
    };
  };
  profile: {
    id: string;
    displayName: string;
    description?: string;
    tagline?: string;
    tagsets?: Tagset[] | undefined;
    url: string;
    avatar?: Visual | undefined;
    references?: Reference[];
  };
};

type VirtualContributorFromProps = {
  name: string;
  nameID: string;
  description: string;
  tagline?: string;
  tagsets?: Tagset[];
  hostDisplayName: string;
  subSpaceName: string;
  references?: Reference[];
};

type Props = {
  virtualContributor: VirtualContributorProps;
  bokProfile?: BasicSpaceProps;
  avatar: Visual | undefined;
  onSave?: (virtualContributor: UpdateVirtualContributorInput) => void;
  hasBackNavigation?: boolean;
};

export const VirtualContributorForm = ({
  virtualContributor,
  bokProfile,
  avatar,
  onSave,
  hasBackNavigation = true,
}: Props) => {
  const { t } = useTranslation();
  const handleBack = useBackToStaticPath(virtualContributor.profile.url);
  const cols = useColumns();
  const isMobile = cols < 5;

  const {
    nameID,
    profile: { id: vcProfileId, displayName, description, tagline, tagsets, references: vcReferences },
    account,
  } = virtualContributor;

  const { displayName: subSpaceName } = bokProfile ?? {};

  const initialValues: VirtualContributorFromProps = useMemo(
    () => ({
      name: displayName,
      nameID: nameID,
      description: description ?? '',
      tagline: tagline,
      tagsets: tagsets,
      hostDisplayName: account?.host?.profile.displayName ?? '',
      subSpaceName: subSpaceName ?? '',
      references: vcReferences ?? [],
    }),
    [displayName, nameID, description, tagline, tagsets, account, subSpaceName, vcReferences]
  );

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name ?? yup.string(),
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    description: profileSegmentSchema.fields?.description ?? yup.string(),
  });

  const getUpdatedTagsets = (updatedTagsets: Tagset[]) => {
    const result: UpdateTagset[] = [];
    updatedTagsets.forEach(updatedTagset => {
      const originalTagset = tagsets?.find(value => value.name === updatedTagset.name);
      if (originalTagset) {
        result.push({ ...originalTagset, tags: updatedTagset.tags });
      }
    });

    return result;
  };

  // use keywords tagset (existing after creation of VC) as tags
  const keywordsTagsetWrapped = useMemo(() => {
    const tagset = tagsets?.find(x => x.name.toLowerCase() === KEYWORDS_TAGSET);
    return tagset && [tagset];
  }, [tagsets]);

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFromProps) => {
    const { tagsets, description, tagline, name, ...otherData } = values;
    const updatedTagsets = getUpdatedTagsets(tagsets ?? []);

    const updatedVirtualContributor = {
      ID: virtualContributor.id,
      profileData: {
        displayName: name,
        description,
        tagline,
        tagsets: updatedTagsets.map(r => ({
          ID: r.id,
          tags: r.tags ?? [],
        })),
        references: otherData?.references?.map(r => ({
          ID: r.id,
          name: r.name,
          uri: r.uri,
          description: r.description,
        })),
      },
      ...otherData,
    };

    await onSave?.(updatedVirtualContributor);
  });

  const HostFields = () => (
    <>
      <FormikInputField name="hostDisplayName" title="Host" required readOnly disabled />
      <FormikInputField
        name="subSpaceName"
        title={t('virtualContributorSpaceSettings.bodyOfKnowledge')}
        required
        readOnly
        disabled
      />
    </>
  );

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values: { references, hostDisplayName }, handleSubmit }) => {
          return (
            <Form noValidate onSubmit={handleSubmit}>
              <GridContainer>
                <GridProvider columns={12}>
                  <GridItem columns={isMobile ? cols : 2}>
                    <Box display="flex" justifyContent="center">
                      <VisualUpload
                        visual={avatar}
                        altText={t('visuals-alt-text.avatar.contributor.text', {
                          displayName,
                          altText: virtualContributor.profile.avatar?.alternativeText,
                        })}
                      />
                    </Box>
                  </GridItem>
                  <GridItem columns={isMobile ? cols : 8}>
                    <Gutters>
                      <NameSegment disabled required />
                      <ProfileSegment />
                      {keywordsTagsetWrapped ? (
                        <TagsetSegment tagsets={keywordsTagsetWrapped} title={t('common.tags')} />
                      ) : null}

                      <ProfileReferenceSegment
                        fullWidth
                        compactMode
                        profileId={vcProfileId}
                        references={references ?? []}
                      />

                      {hostDisplayName && <HostFields />}
                      <Actions marginTop={theme.spacing(2)} sx={{ justifyContent: 'end' }}>
                        {hasBackNavigation && (
                          <Button onClick={handleBack} variant="text">
                            {t('buttons.back')}
                          </Button>
                        )}
                        <LoadingButton loading={loading} type="submit" variant="contained">
                          {t('buttons.save')}
                        </LoadingButton>
                      </Actions>
                    </Gutters>
                  </GridItem>
                </GridProvider>
              </GridContainer>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default VirtualContributorForm;

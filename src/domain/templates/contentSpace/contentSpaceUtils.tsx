import { EmptyTemplateContentSpaceModel, TemplateContentSpaceModel } from './TemplateContentSpaceModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapInputDataToTemplateContentSpaceModel = (inputData: any | undefined): TemplateContentSpaceModel => {
  if (!inputData) {
    return EmptyTemplateContentSpaceModel;
  }
  const result: TemplateContentSpaceModel = {
    id: inputData.contentSpace?.id || '',
    about: inputData.contentSpace?.about,
    collaboration: {
      id: inputData.contentSpace?.collaboration?.id || '',
      innovationFlow: {
        id: inputData.contentSpace?.collaboration?.innovationFlow?.id || '',
        states: inputData.contentSpace?.collaboration?.innovationFlow?.states || [],
      },
      calloutsSet: {
        callouts: inputData.contentSpace?.collaboration?.calloutsSet?.callouts || [],
      },
    },
    settings: inputData.contentSpace?.settings || undefined,
  };
  return result;
};

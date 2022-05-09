import axios from 'axios';
import { DocumentNode, print } from 'graphql';

const queryRequest = async <TResponseData = any>(url: string, queryDocument: DocumentNode) => {
  return axios.post<{ data: TResponseData }>(
    url,
    {
      query: print(queryDocument),
    },
    {
      responseType: 'json',
      withCredentials: true,
    }
  );
};
export default queryRequest;

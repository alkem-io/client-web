import axios from 'axios';
import { type DocumentNode, print } from 'graphql';

const queryRequest = async <TResponseData = unknown>(url: string, queryDocument: DocumentNode) => {
  return axios.post<{ data: TResponseData }>(
    url,
    { query: print(queryDocument) },
    { responseType: 'json', withCredentials: true, timeout: 8000 }
  );
};

export default queryRequest;

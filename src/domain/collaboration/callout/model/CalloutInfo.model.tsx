export interface CalloutInfo {
  id: string;
  type: string;
  framing: {
    profile: {
      displayName: string;
      url: string;
    };
  };
  activity: number;
}

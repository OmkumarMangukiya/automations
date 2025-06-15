 export interface Prospect {
  row_number: number;
  Name: string;
  "Phone Number": number;
  Status: string;
  Qualified: string | boolean;
  Budget: string | number;
  "Pain Point/ Solution": string;
  Summary: string;
}

export interface AnalyticsData {
  row_number: number;
  Date: string;
  Contacted: number;
  Interested: number;
  "Average Budget": number;
}

export interface ProspectData {
  Name: string;
  'Phone Number': string;
  Status?: string;
  Budget?: number;
  'Last Contacted'?: string;
  // Handle the typo in the API response
  Bugdet?: number;
}

export interface WorkflowData {
  'Workflow Name'?: string;
  'Prospects Data': Prospect[];
  Analytics: AnalyticsData[];
}

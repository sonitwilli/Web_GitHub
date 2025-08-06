import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

// ------------------------------------------ START INTERFACE ------------------------------------------

// Report Option Interface for GET response
export interface ReportOption {
  id?: string;
  msg?: string;
}

// GET Response Interface
export interface GetReportOptionsResponse {
  status?: string;
  error_code?: string;
  data?: ReportOption[];
  msg?: string;
}

// POST Request Interface
export interface SubmitReportRequest {
  video_id?: string;
  chapter_id?: string;
  ref_id?: string;
  chapter_ref_id?: string;
  app_id?: string;
  report_ids?: string[];
  report_text?: string;
  item_id?: string;
  type_content?: string;
}

// POST Response Interface
export interface SubmitReportResponse {
  status?: string;
  error_code?: string;
  data?: {
    title?: string;
  };
  msg?: string;
}

// GET Request Parameters
export interface GetReportOptionsParams {
  item_id?: string;
  chapter_id?: string;
  type_content?: string;
}

// ------------------------------------------ END INTERFACE ------------------------------------------

// Helper function to build GET URL
const handleUrlAPI = (
  item_id = '',
  chapter_id = '0',
  type_content = '',
): string => {
  return `config/report?item_id=${item_id}&chapter_id=${chapter_id}&type_content=${type_content}`;
};

// GET function to fetch report options
export const getReportOptions = async (
  params: GetReportOptionsParams = {},
): Promise<AxiosResponse<GetReportOptionsResponse>> => {
  try {
    const { item_id = '', chapter_id = '0', type_content = '' } = params;
    const url = handleUrlAPI(item_id, chapter_id, type_content);

    const response = await axiosInstance.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching report options:', error);
    throw error;
  }
};

// POST function to submit report
export const submitReport = async (
  data: SubmitReportRequest,
): Promise<AxiosResponse<SubmitReportResponse>> => {
  try {
    const response = await axiosInstance.post('config/report', data);
    return response;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

// Export helper function for external use
export { handleUrlAPI };

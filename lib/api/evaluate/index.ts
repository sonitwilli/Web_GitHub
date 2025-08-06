import { AxiosResponse } from 'axios';
import { axiosInstance } from '@/lib/api/axios';

// Định nghĩa interface cho Request Parameters
export interface EvaluateRequestParams {
  vod_id?: string;
  feedback_id?: string;
  user_opinion?: string;
}

// Định nghĩa interface cho Response Data
export interface EvaluateResponseData {
  evaluation_id?: number;
  vod_id?: string;
  feedback_id?: string;
  title?: string;
  user_opinion?: string;
  profileid?: string;
}

// Định nghĩa interface cho Response
export interface EvaluateResponse {
  data?: EvaluateResponseData;
  message?: string;
  status?: string;
}

// Function gọi API đánh giá
export const submitEvaluation = async (
  params: EvaluateRequestParams,
  profileid: string | number,
): Promise<AxiosResponse<EvaluateResponse>> => {
  try {
    axiosInstance.defaults.headers.common['profileid'] = profileid;
    return await axiosInstance.post(
      '/bigdata/hermes/v1/analysis/review/evaluate',
      {
        ...params,
      },
    );
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    throw error;
  }
};

// Định nghĩa interface cho Feedback Item
export interface FeedbackItem {
  id?: string;
  title?: string;
}

// Định nghĩa interface cho Get Feedback Response
export interface GetFeedbackResponse {
  data?: FeedbackItem[];
  message?: string;
  status?: number;
}

// Function gọi API lấy danh sách feedback
export const getFeedbackList = async (
  profileid: string | number,
): Promise<AxiosResponse<GetFeedbackResponse>> => {
  try {
    axiosInstance.defaults.headers.common['profileid'] = profileid;
    return await axiosInstance.get(
      '/bigdata/hermes/v1/analysis/review/feedback/get',
    );
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    throw error;
  }
};

// Định nghĩa interface cho Positive/Negative Summary
export interface SummaryItem {
  summary?: string[];
  rate?: string;
  icon_url?: string;
}

// Định nghĩa interface cho Topic
export interface Topic {
  topic?: string;
  title?: string;
  icon_url?: string;
  positive?: SummaryItem;
  negative?: SummaryItem;
}

// Định nghĩa interface cho External/Internal Data
export interface ReviewData {
  html?: string;
  overview?: string;
  topics?: Topic[];
}

// Định nghĩa interface cho Summary Response Data
export interface SummaryResponseData {
  external?: ReviewData;
  internal?: ReviewData;
  profileid?: string;
  vod_id?: string;
}

// Định nghĩa interface cho Get Summary Response
export interface GetSummaryResponse {
  data?: SummaryResponseData;
  message?: string;
  status?: string;
}

// Function gọi API lấy review summary
export const getReviewSummary = async (
  vod_id: string,
  profileid: string | number,
): Promise<AxiosResponse<GetSummaryResponse>> => {
  try {
    axiosInstance.defaults.headers.common['profileid'] = profileid;
    return await axiosInstance.post(
      '/bigdata/hermes/v1/analysis/review/summary/get',
      {
        vod_id,
        profileid,
      },
    );
  } catch (error) {
    console.error('Error fetching review summary:', error);
    throw error;
  }
};

import { AxiosResponse } from "axios";
import { axiosInstance } from "../axios";

export interface LiveChatTokenResponse {
  status: string;
  msg?: string;
  error_code?: string;
  data?: {
    token?: string;
  };
}

const getLiveChatToken = async (): Promise<
  AxiosResponse<LiveChatTokenResponse>
> => {
  try {
    return await axiosInstance.post("/account/user/get_token_livechat");
  } catch (error) {
    console.error("Error get token livechat:", error);
    throw error;
  }
};

export { getLiveChatToken };

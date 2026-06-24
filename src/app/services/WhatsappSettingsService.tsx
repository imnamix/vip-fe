import { ApiRequest } from '../config/AxiosInterceptor';

const BASE = 'whatsappSettings';

export const getWhatsappSettings = async () => {
  const res = await ApiRequest.get(`${BASE}/get`);
  return res.data;
};

export const saveWhatsappSettings = async (payload: {
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  verifyToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookUrl?: string;
  isActive?: boolean;
}) => {
  const res = await ApiRequest.post(`${BASE}/save`, payload);
  return res.data;
};

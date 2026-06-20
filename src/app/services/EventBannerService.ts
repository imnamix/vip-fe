import { ApiRequest } from "../config/AxiosInterceptor";

const BASE = "event-banner";

export const getEventBanner = async () => {
  const res = await ApiRequest.get(`${BASE}/get`);
  return res.data;
};

export const saveEventBanner = async (payload: { slides: { title: string; description: string; image?: string }[] }) => {
  const res = await ApiRequest.post(`${BASE}/save`, payload);
  return res.data;
};

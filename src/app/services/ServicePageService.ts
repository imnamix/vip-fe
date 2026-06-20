import { ApiRequest } from "../config/AxiosInterceptor";

const BASE = "service-page";

export const getServicePage = async () => {
  const res = await ApiRequest.get(`${BASE}/get`);
  return res.data;
};

export const saveServicePage = async (payload: any) => {
  const res = await ApiRequest.post(`${BASE}/save`, payload);
  return res.data;
};

import { ApiRequest } from '../config/AxiosInterceptor';

const BASE = 'generalInquiry';

export const createGeneralInquiry = async (payload: {
  name: string;
  mobile: string;
  message?: string;
  lookingFor?: string;
}) => {
  const response = await ApiRequest.post(`${BASE}/create`, payload);
  return response.data;
};

export const getAllGeneralInquiries = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) => {
  let url = `${BASE}/getAll?page=${page}&limit=${limit}`;
  if (search)  url += `&search=${encodeURIComponent(search)}`;
  if (status)  url += `&status=${encodeURIComponent(status)}`;
  const response = await ApiRequest.get(url);
  return response.data;
};

export const getGeneralInquiryById = async (id: number) => {
  const response = await ApiRequest.get(`${BASE}/getById/${id}`);
  return response.data;
};

export const updateGeneralInquiry = async (id: number, payload: Partial<{
  name: string; mobile: string; message: string; lookingFor: string; status: string;
}>) => {
  const response = await ApiRequest.patch(`${BASE}/update/${id}`, payload);
  return response.data;
};

export const deleteGeneralInquiries = async (ids: number[]) => {
  const response = await ApiRequest.delete(`${BASE}/delete`, { data: { ids } });
  return response.data;
};

import { ApiRequest } from "../config/AxiosInterceptor";

export const getAllVipNumbers = async (
  page = 1,
  limit = 10,
  search = "",
  category = "",
) => {
  let url = `vip-numbers/getAll?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category && category !== "All") url += `&category=${encodeURIComponent(category)}`;
  const res = await ApiRequest.get(url);
  return res.data;
};

export const getVipNumberById = async (id: number | string) => {
  const res = await ApiRequest.get(`vip-numbers/getById/${id}`);
  return res.data;
};

export const createVipNumber = async (payload: object) => {
  const res = await ApiRequest.post(`vip-numbers/create`, payload);
  return res.data;
};

export const updateVipNumber = async (id: number | string, payload: object) => {
  const res = await ApiRequest.put(`vip-numbers/update/${id}`, payload);
  return res.data;
};

export const deleteVipNumber = async (id: number | string) => {
  const res = await ApiRequest.delete(`vip-numbers/delete/${id}`);
  return res.data;
};

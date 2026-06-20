import { ApiRequest } from "../config/AxiosInterceptor";

const BASE = "testimonials";

export const createTestimonial = async (payload: any) => {
  const res = await ApiRequest.post(`${BASE}/create`, payload);
  return res.data;
};

export const getAllTestimonials = async (skip = 0, take = 1000, search = "") => {
  const res = await ApiRequest.get(`${BASE}/getAll`, { params: { skip, take, search } });
  return res.data;
};

export const updateTestimonial = async (id: number | string, payload: any) => {
  const res = await ApiRequest.put(`${BASE}/update/${id}`, payload);
  return res.data;
};

export const deleteTestimonial = async (id: number | string) => {
  const res = await ApiRequest.delete(`${BASE}/delete/${id}`);
  return res.data;
};

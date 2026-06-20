import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "contact";

const URL = {
  CREATE: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const createContact = async (payload: any) => {
  const response = await ApiRequest.post(URL.CREATE, payload);
  return response.data;
};

export const getAllContacts = async (page = 1, limit = 1) => {
  const response = await ApiRequest.get(URL.GET_ALL, { params: { page, limit } });
  return response.data;
};

export const getContactById = async (id: number | string) => {
  const response = await ApiRequest.get(URL.GET_BY_ID(id));
  return response.data;
};

export const updateContact = async (payload: any, id: number | string) => {
  const response = await ApiRequest.put(URL.UPDATE(id), payload);
  return response.data;
};

export const deleteContact = async (ids: number[]) => {
  const response = await ApiRequest.delete(URL.DELETE, { data: { ids } });
  return response.data;
};

import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "contact-info";

const URL = {
  CREATE: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: (id: number | string) => `${BASE_URL}/delete/${id}`,
};

export const createContactInfo = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating contact info:", error);
    throw error;
  }
};

export const getAllContactInfo = async () => {
  try {
    const response = await ApiRequest.get(URL.GET_ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching contact info:", error);
    throw error;
  }
};

export const getContactInfoById = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching contact info:", error);
    throw error;
  }
};

export const updateContactInfo = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error("Error updating contact info:", error);
    throw error;
  }
};

export const deleteContactInfo = async (id: number | string) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE(id));
    return response.data;
  } catch (error) {
    console.error("Error deleting contact info:", error);
    throw error;
  }
};

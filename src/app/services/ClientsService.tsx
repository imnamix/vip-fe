import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "clients";

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addClient = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding client:", error);
    throw error;
  }
};

export const getAllClients = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string,
) => {
  try {
    let clientsUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      clientsUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(clientsUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const getClientByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching client with ID ${id}:`, error);
    throw error;
  }
};

export const updateClient = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating client with ID ${id}:`, error);
    throw error;
  }
};

export const deleteClient = async (data: any) => {
  try {
    const response = await ApiRequest.post(URL.DELETE, data);
    return response.data;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

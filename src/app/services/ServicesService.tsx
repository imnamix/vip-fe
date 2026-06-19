import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "services";

const URL = {
  CREATE: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: (id: number | string) => `${BASE_URL}/delete/${id}`,
};

export const createService = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

export const getAllServices = async (
  skip: number = 0,
  take: number = 5,
  search: string = "",
) => {
  try {
    const response = await ApiRequest.get(URL.GET_ALL, {
      params: {
        skip,
        take,
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const getServiceById = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching service:", error);
    throw error;
  }
};

export const updateService = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

export const deleteService = async (id: number | string) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE(id));
    return response.data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "work-industry";

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addWorkIndustry = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding work industry:", error);
    throw error;
  }
};

export const getAllWorkIndustry = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string,
) => {
  try {
    let workIndustryUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      workIndustryUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(workIndustryUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching work industry:", error);
    throw error;
  }
};

export const getWorkIndustryByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching work industry with ID ${id}:`, error);
    throw error;
  }
};

export const updateWorkIndustry = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating work industry with ID ${id}:`, error);
    throw error;
  }
};

export const deleteWorkIndustry = async (payload: any) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE, { data: payload });
    return response.data;
  } catch (error) {
    console.error("Error deleting work industry:", error);
    throw error;
  }
};

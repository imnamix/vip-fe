import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "funded-projects";

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addFundedProject = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding funded project:", error);
    throw error;
  }
};

export const getAllFundedProjects = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string,
) => {
  try {
    let fundedProjectsUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      fundedProjectsUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(fundedProjectsUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching funded projects:", error);
    throw error;
  }
};

export const getFundedProjectByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching funded project with ID ${id}:`, error);
    throw error;
  }
};

export const updateFundedProject = async (
  payload: any,
  id: number | string,
) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating funded project with ID ${id}:`, error);
    throw error;
  }
};

export const deleteFundedProject = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.DELETE, payload);
    return response.data;
  } catch (error) {
    console.error("Error deleting funded project:", error);
    throw error;
  }
};

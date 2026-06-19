import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "projectLocation";

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAllProjectLocation`,
  GET_BY_ID: (id: number | string) =>
    `${BASE_URL}/getProjectLocationById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/updateProjectLocation/${id}`,
  DELETE: `${BASE_URL}/deleteProjectLocation`,
};

export const addProjectLocation = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding projectLocation:", error);
    throw error;
  }
};

export const getProjectLocationByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching projectLocation with ID ${id}:`, error);
    throw error;
  }
};

export const updateProjectLocation = async (
  payload: any,
  id: number | string
) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating projectLocation with ID ${id}:`, error);
    throw error;
  }
};

export const getAllProjectLocation = async (searchKeys?: string) => {
  try {
    let projectLocationUrl = `${URL.GET_ALL}`;
    if (searchKeys) {
      projectLocationUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(projectLocationUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching projectLocation:", error);
    throw error;
  }
};

export const deleteProjectLocation = async (id: any) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE, {
      data: id,
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

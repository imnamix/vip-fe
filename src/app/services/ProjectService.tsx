import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "project";

const URL = {
  COMMON_URL: `${BASE_URL}/createProject`,
  GET_ALL: `${BASE_URL}/getAllProjects`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getProject/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/updateProject/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addProject = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const getProjectByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw error;
  }
};

export const updateProject = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw error;
  }
};

export const getAllProjects = async (searchKeys?: string) => {
  try {
    let projectUrl = `${URL.GET_ALL}`;
    if (searchKeys) {
      projectUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(projectUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const deleteProjects = async (id: any) => {
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

import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'roles';

const URL = {
  CREATE:    `${BASE_URL}/create`,
  GET_ALL:   `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE:    (id: number | string) => `${BASE_URL}/updateRole/${id}`,
  DELETE:    `${BASE_URL}/deleteRole`,
};

export const getAllRoles = async (
  page: number = 1,
  limit: number = 20,
  searchKeys?: string,
) => {
  try {
    let url = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) url += `&search=${encodeURIComponent(searchKeys)}`;
    const response = await ApiRequest.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleById = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with ID ${id}:`, error);
    throw error;
  }
};

export const addRole = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding role:', error);
    throw error;
  }
};

export const updateRole = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating role with ID ${id}:`, error);
    throw error;
  }
};

export const deleteRole = async (payload: { ids: (number | string)[] }) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE, { data: payload });
    return response.data;
  } catch (error) {
    console.error('Error deleting role(s):', error);
    throw error;
  }
};

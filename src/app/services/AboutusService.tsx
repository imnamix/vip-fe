import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'aboutus';

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/updateAboutUs/${id}`,
  DELETE: `${BASE_URL}/deleteAboutus`,
};

export const addAboutUs = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding aboutus:', error);
    throw error;
  }
};

export const getAboutUsByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching aboutus with ID ${id}:`, error);
    throw error;
  }
};

export const updateAboutUs = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating aboutus with ID ${id}:`, error);
    throw error;
  }
};

export const getAllAboutUs = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string
) => {
  try {
    let aboutUsUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      aboutUsUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(aboutUsUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching aboutus:', error);
    throw error;
  }
};

export const deleteAboutUs = async (id: any) => {
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

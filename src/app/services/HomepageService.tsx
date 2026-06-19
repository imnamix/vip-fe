import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'homePage';

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addHomepage = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding homepage:', error);
    throw error;
  }
};

export const getAllHomepage = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string
) => {
  try {
    let homepageUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      homepageUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(homepageUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage:', error);
    throw error;
  }
};
export const getHomepageByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching homepage with ID ${id}:`, error);
    throw error;
  }
};

export const updateHomepage = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating homepage with ID ${id}:`, error);
    throw error;
  }
};

export const deleteHomepage = async (id: any) => {
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

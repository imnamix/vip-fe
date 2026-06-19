import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'newsBlogs';

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAllNewsBlog`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addNews = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding news:', error);
    throw error;
  }
};

export const getAllNews = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string
) => {
  try {
    let newsUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      newsUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(newsUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getNewsByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with ID ${id}:`, error);
    throw error;
  }
};

export const updateNews = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating news with ID ${id}:`, error);
    throw error;
  }
};

export const deleteNews = async (id: any) => {
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

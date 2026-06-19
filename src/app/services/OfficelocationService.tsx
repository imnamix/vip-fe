import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'officeLocation';

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAllOfficeLocation`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getAllOfficeLocation/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/updateOfficeLoc/${id}`,
  DELETE: `${BASE_URL}/deleteOfficeLoc`,
};

export const addOfficeLocation = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding office location:', error);
    throw error;
  }
};

export const getOfficeLocationByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    console.log('response', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching office location with ID ${id}:`, error);
    throw error;
  }
};

export const updateOfficeLocation = async (
  payload: any,
  id: number | string
) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating office location with ID ${id}:`, error);
    throw error;
  }
};

export const getAllOfficeLocation = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string
) => {
  try {
    let officeLocationUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      officeLocationUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(officeLocationUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching office location:', error);
    throw error;
  }
};

export const deleteOfficeLocation = async (id: any) => {
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

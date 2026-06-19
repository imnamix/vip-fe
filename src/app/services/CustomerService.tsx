import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'customers';

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAllCustomers`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getCustomerById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/updateCustomer/${id}`,
  DELETE: `${BASE_URL}/deleteCustomer`,
};

export const addCustomer = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const getCustomerByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    throw error;
  }
};

export const updateCustomer = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);
    throw error;
  }
};

export const getAllCustomers = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string
) => {
  try {
    let customerUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      customerUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(customerUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: any) => {
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

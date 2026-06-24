import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'enquiry';

const URL = {
  GET_ALL: `${BASE_URL}/allEnquiries`,
  CREATE: `${BASE_URL}/create`,
  DELETE: `${BASE_URL}/delete`,
};

export const createInquiry = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

export const getEnquiryById = async (id: number) => {
  try {
    const response = await ApiRequest.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching enquiry ${id}:`, error);
    throw error;
  }
};

export const updateEnquiry = async (id: number, payload: any) => {
  try {
    const response = await ApiRequest.patch(`${BASE_URL}/update/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating enquiry ${id}:`, error);
    throw error;
  }
};

export const getAllEnquires = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string,
  status?: string
) => {
  try {
    let enquiresUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) enquiresUrl += `&search=${encodeURIComponent(searchKeys)}`;
    if (status)     enquiresUrl += `&status=${encodeURIComponent(status)}`;
    const response = await ApiRequest.get(enquiresUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching enquires:', error);
    throw error;
  }
};

export const getStatusCounts = async () => {
  try {
    const response = await ApiRequest.get('enquiry/statusCounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching status counts:', error);
    throw error;
  }
};

export const deleteEnquires = async (id: any) => {
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

import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'event-registration';

const URL = {
  CREATE: `${BASE_URL}/create`,
  BY_EVENT: (eventId: number | string) => `${BASE_URL}/byEvent/${eventId}`,
  UPDATE_STATUS: (id: number | string) => `${BASE_URL}/updateStatus/${id}`,
};

export const registerForEvent = async (payload: {
  eventId: number;
  name: string;
  mobile: string;
  address?: string;
}) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, payload);
    return response.data;
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
};

export const getRegistrationsByEvent = async (eventId: number | string) => {
  try {
    const response = await ApiRequest.get(URL.BY_EVENT(eventId));
    return response.data;
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    throw error;
  }
};

export const updateRegistrationStatus = async (
  id: number | string,
  status: 'Registered' | 'Confirmed',
) => {
  try {
    const response = await ApiRequest.patch(URL.UPDATE_STATUS(id), { status });
    return response.data;
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
};

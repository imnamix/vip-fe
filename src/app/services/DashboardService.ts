import { ApiRequest } from '../config/AxiosInterceptor';

export const getDashboardSummary = () =>
  ApiRequest.get('dashboard/summary').then(r => r.data);

import { createContext, useContext } from 'react';

export const AdminThemeContext = createContext(false);
export const useAdminTheme = () => useContext(AdminThemeContext);

import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useBrandMeta } from './hooks/useBrandMeta';

export default function App() {
  useBrandMeta();
  return <RouterProvider router={router} />;
}

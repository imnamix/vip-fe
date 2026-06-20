import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import EventsGallery from './pages/EventsGallery';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/Customers';
import CustomerForm from './pages/admin/CustomerForm';
import Inquiries from './pages/admin/Inquiries';
import InquiryDetail from './pages/admin/InquiryDetail';
import Numerologists from './pages/admin/Numerologists';
import NumerologistDetail from './pages/admin/NumerologistDetail';
import NumerologistForm from './pages/admin/NumerologistForm';
import AdminEvents from './pages/admin/AdminEvents';
import EventForm from './pages/admin/EventForm';
import EventView from './pages/admin/EventView';
import EventBannerSlides from './pages/admin/EventBannerSlides';
import ContentManagement from './pages/admin/ContentManagement';
import UserRoles from './pages/admin/UserRoles';
import DeliveryTracking from './pages/admin/DeliveryTracking';
import Notifications from './pages/admin/Notifications';
import AdminProfile from './pages/admin/AdminProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'services', Component: Services },
      { path: 'events-gallery', Component: EventsGallery },
      { path: 'contact', Component: Contact },
    ],
  },
  { path: '/admin/login', Component: AdminLogin },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'customers', Component: Customers },
      { path: 'customers/new', Component: CustomerForm },
      { path: 'customers/:id/edit', Component: CustomerForm },
      { path: 'inquiries', Component: Inquiries },
      { path: 'inquiries/:id', Component: InquiryDetail },
      { path: 'numerologists', Component: Numerologists },
      { path: 'numerologists/new', Component: NumerologistForm },
      { path: 'numerologists/:id', Component: NumerologistDetail },
      { path: 'numerologists/:id/edit', Component: NumerologistForm },
      { path: 'events', Component: AdminEvents },
      { path: 'events/banner', Component: EventBannerSlides },
      { path: 'events/new', Component: EventForm },
      { path: 'events/:id', Component: EventView },
      { path: 'events/:id/edit', Component: EventForm },
      { path: 'content', Component: ContentManagement },
      { path: 'roles', Component: UserRoles },
      { path: 'delivery', Component: DeliveryTracking },
      { path: 'notifications', Component: Notifications },
      { path: 'profile', Component: AdminProfile },
    ],
  },
]);

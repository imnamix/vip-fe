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
import GeneralInquiries from './pages/admin/GeneralInquiries';
import Numerologists from './pages/admin/Numerologists';
import NumerologistDetail from './pages/admin/NumerologistDetail';
import NumerologistForm from './pages/admin/NumerologistForm';
import AdminEvents from './pages/admin/AdminEvents';
import EventForm from './pages/admin/EventForm';
import EventView from './pages/admin/EventView';
import EventBannerSlides from './pages/admin/EventBannerSlides';
import VipNumbers from './pages/admin/VipNumbers';
import VipNumberForm from './pages/admin/VipNumberForm';
import VipNumberView from './pages/admin/VipNumberView';
import ContentManagement from './pages/admin/ContentManagement';
import Roles from './pages/admin/Roles';
import AdminUsers from './pages/admin/AdminUsers';
import DeliveryTracking from './pages/admin/DeliveryTracking';
import Notifications from './pages/admin/Notifications';
import AdminProfile from './pages/admin/AdminProfile';
import Settings from './pages/admin/Settings';
import Forbidden from './pages/admin/Forbidden';
import { ProtectedRoute } from './components/ProtectedRoute';

const P = ProtectedRoute;

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
      {
        index: true,
        element: <P module="Dashboard"><Dashboard /></P>,
      },
      {
        path: 'customers',
        element: <P module="Customers"><Customers /></P>,
      },
      {
        path: 'customers/new',
        element: <P module="Customers" action="write"><CustomerForm /></P>,
      },
      {
        path: 'customers/:id/edit',
        element: <P module="Customers" action="update"><CustomerForm /></P>,
      },
      {
        path: 'inquiries',
        element: <P module="Inquiry"><Inquiries /></P>,
      },
      {
        path: 'inquiries/:id',
        element: <P module="Inquiry"><InquiryDetail /></P>,
      },
      {
        path: 'general-inquiries',
        element: <P module="General Inquiry"><GeneralInquiries /></P>,
      },
      {
        path: 'numerologists',
        element: <P module="Customers"><Numerologists /></P>,
      },
      {
        path: 'numerologists/new',
        element: <P module="Customers" action="write"><NumerologistForm /></P>,
      },
      {
        path: 'numerologists/:id',
        element: <P module="Customers"><NumerologistDetail /></P>,
      },
      {
        path: 'numerologists/:id/edit',
        element: <P module="Customers" action="update"><NumerologistForm /></P>,
      },
      {
        path: 'events',
        element: <P module="Events"><AdminEvents /></P>,
      },
      {
        path: 'events/banner',
        element: <P module="Events" action="write"><EventBannerSlides /></P>,
      },
      {
        path: 'events/new',
        element: <P module="Events" action="write"><EventForm /></P>,
      },
      {
        path: 'events/:id',
        element: <P module="Events"><EventView /></P>,
      },
      {
        path: 'events/:id/edit',
        element: <P module="Events" action="update"><EventForm /></P>,
      },
      {
        path: 'vip-numbers',
        element: <P module="Top VIP Numbers"><VipNumbers /></P>,
      },
      {
        path: 'vip-numbers/new',
        element: <P module="Top VIP Numbers" action="write"><VipNumberForm /></P>,
      },
      {
        path: 'vip-numbers/:id',
        element: <P module="Top VIP Numbers"><VipNumberView /></P>,
      },
      {
        path: 'vip-numbers/:id/edit',
        element: <P module="Top VIP Numbers" action="update"><VipNumberForm /></P>,
      },
      {
        path: 'content',
        element: <P module="Content"><ContentManagement /></P>,
      },
      {
        path: 'roles',
        element: <P module="Roles"><Roles /></P>,
      },
      {
        path: 'users',
        element: <P module="Users"><AdminUsers /></P>,
      },
      {
        path: 'delivery',
        element: <P module="Delivery"><DeliveryTracking /></P>,
      },
      {
        path: 'notifications',
        element: <P module="Notifications"><Notifications /></P>,
      },
      // Profile is self-service — any authenticated user can access
      { path: 'profile', Component: AdminProfile },
      {
        path: 'settings',
        element: <P module="Settings"><Settings /></P>,
      },
      { path: '403', Component: Forbidden },
    ],
  },
]);

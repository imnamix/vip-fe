import {
  LayoutDashboard, Users, MessageSquare, Calendar,
  FileText, Shield, Truck, Bell, Settings,
  Hash,
} from 'lucide-react';
import type { PermissionsMap } from '../types/permission.types';

// Single source of truth for admin nav items — used by the sidebar (AdminLayout)
// and by the post-login/403 redirect logic to find the first route a user can access.
export const menuItems = [
  { label: 'Dashboard',         path: '/admin',                   icon: LayoutDashboard, module: 'Dashboard'        },
  { label: 'Inquiries',         path: '/admin/inquiries',         icon: MessageSquare,   module: 'Inquiry'          },
  { label: 'General Inquiries', path: '/admin/general-inquiries', icon: MessageSquare,   module: 'General Inquiry'  },
  { label: 'Events',            path: '/admin/events',            icon: Calendar,        module: 'Events'           },
  { label: 'Top VIP Numbers',   path: '/admin/vip-numbers',       icon: Hash,            module: 'Top VIP Numbers'  },
  { label: 'Content',           path: '/admin/content',           icon: FileText,        module: 'Content'     },
  { label: 'Roles',             path: '/admin/roles',             icon: Shield,          module: 'Roles'       },
  { label: 'Users',             path: '/admin/users',             icon: Users,           module: 'Users'       },
  { label: 'Delivery',          path: '/admin/delivery',          icon: Truck,           module: 'Delivery'    },
  { label: 'Notifications',     path: '/admin/notifications',     icon: Bell,            module: 'Notifications' },
  { label: 'Settings',          path: '/admin/settings',          icon: Settings,        module: 'Settings'    },
];

// Fallback for any authenticated user regardless of module permissions (self-service page).
export const FALLBACK_PATH = '/admin/profile';

export function getLandingPath(permissions: PermissionsMap): string {
  return menuItems.find(item => permissions[item.module]?.read === true)?.path ?? FALLBACK_PATH;
}

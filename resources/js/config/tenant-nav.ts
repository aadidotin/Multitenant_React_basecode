// resources/js/config/tenant-nav.ts
import { LayoutDashboard, UserRoundKey, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { dashboard as dashboardIndex } from '@/routes/tenant';
import { index as rolesIndex } from '@/routes/tenant/roles';
import { index as usersIndex } from '@/routes/tenant/users';
// import { index as invoicesIndex  } from '@/routes/tenant/invoices';
// import { index as reportsIndex   } from '@/routes/tenant/reports';
// import { index as analyticsIndex } from '@/routes/tenant/analytics';
// import { index as rolesIndex     } from '@/routes/tenant/roles';
// import { index as settingsIndex  } from '@/routes/tenant/settings';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TenantNavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    // undefined = always show (no permission check)
    // string    = only show if this key exists in user's permissions map
    module?: string;
    items?: {
        title: string;
        url: string;
        module?: string; // child-level permission check
    }[];
}

// ── Static nav ────────────────────────────────────────────────────────────────
//
// `module` absent  → always visible
// `module` present → visible only if permissions[module] exists
// Parent with items → visible if at least one child passes its check
//
export const TENANT_NAV: TenantNavItem[] = [
    {
        title: 'Dashboard',
        url: dashboardIndex.url(),
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        url: usersIndex.url(),
        icon: Users,
        module: 'users',
    },
    {
        title: 'Roles & Permissions',
        url: rolesIndex.url(),
        icon: UserRoundKey,
        module: 'roles',
    },
    // {
    //     title : 'Invoices',
    //     url   : invoicesIndex.url(),
    //     icon  : FileText,
    //     module: 'invoices',
    // },
    // {
    //     title : 'Reports',
    //     url   : reportsIndex.url(),
    //     icon  : BarChart2,
    //     module: 'reports',
    // },
    // {
    //     title : 'Analytics',
    //     url   : analyticsIndex.url(),
    //     icon  : TrendingUp,
    //     module: 'analytics',
    // },
    // {
    //     title: 'Settings',
    //     url  : settingsIndex.url(),
    //     icon : Settings,
    //     // parent always visible — children are individually gated
    //     items: [
    //         {
    //             title : 'Users',
    //             url   : usersIndex.url(),
    //             // always visible — every tenant user can see team members
    //         },
    //         {
    //             title : 'Roles',
    //             url   : rolesIndex.url(),
    //             module: 'roles',   // only admins with roles module access
    //         },
    //     ],
    // },
];

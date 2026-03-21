import {
    Boxes,
    Building2,
    LayoutDashboard,
    MessageSquare,
    Package,
    Settings,
    // FileText,
    // BarChart2,
    // TrendingUp,
    // Users,
    // Shield,
    // Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { chatPage, dashboard } from '@/routes/central';
import { index as ModuleIndex } from '@/routes/central/modules';
import { index as SubscriptionIndex } from '@/routes/central/subscription-packages';
import { index as AdminTenantIndex } from '@/routes/central/tenants';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CentralNavItem {
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
export const CENTRAL_NAV: CentralNavItem[] = [
    {
        title: 'Dashboard',
        url: dashboard.url(),
        icon: LayoutDashboard,
    },
    {
        title: 'Chat',
        url: chatPage.url(),
        icon: MessageSquare,
    },
    {
        title: 'Subscriptions',
        url: SubscriptionIndex.url(),
        icon: Package,
    },
    {
        title: 'Modules',
        url: ModuleIndex.url(),
        icon: Boxes,
    },
    {
        title: 'Tenants',
        url: AdminTenantIndex.url(),
        icon: Building2,
    },
    {
        title: 'Settings',
        url: '#',
        icon: Settings,
        items: [
            { title: 'General Setting', url: '#' },
            { title: 'Project Structure', url: '#' },
        ],
    },
];

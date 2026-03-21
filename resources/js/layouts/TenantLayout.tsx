import { usePage } from '@inertiajs/react';
import { AppSidebar } from '@/components/app-sidebar';
import type { NavItem } from '@/components/app-sidebar';
import Header from '@/components/header/Header';
import TrialBanner from '@/components/tenant/TrialBanner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TENANT_NAV } from '@/config/tenant-nav';
import type { TenantNavItem } from '@/config/tenant-nav';
import type { PermissionsMap } from '@/types/permission';

// ── Permission filter ─────────────────────────────────────────────────────────

function filterNav(
    items: TenantNavItem[],
    permissions: PermissionsMap,
    currentUrl: string,
): NavItem[] {
    const hasModule = (module?: string): boolean =>
        !module || (!!permissions && module in permissions);

    return items
        .filter((item) => {
            // Items with children: show if at least one child passes
            if (item.items && item.items.length > 0) {
                return item.items.some((child) => hasModule(child.module));
            }
            return hasModule(item.module);
        })
        .map(
            (item): NavItem => ({
                title: item.title,
                url: item.url,
                icon: item.icon,
                isActive: currentUrl === item.url,
                // Filter children too
                items: item.items
                    ?.filter((child) => hasModule(child.module))
                    .map((child) => ({
                        title: child.title,
                        url: child.url,
                    })),
            }),
        );
}

export default function TenantLayout({
    children,
    fullLayout = false,
}: {
    children: React.ReactNode;
    fullLayout?: boolean;
}) {
    const { permissions, url } = usePage().props as {
        permissions: PermissionsMap;
        url: string;
    };

    const navItems = filterNav(TENANT_NAV, permissions, url ?? '');

    return (
        <SidebarProvider>
            <TrialBanner />
            <AppSidebar navMain={navItems} />
            <SidebarInset>
                <Header />
                <div className={`${!fullLayout ? 'p-4' : ''}`}>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}

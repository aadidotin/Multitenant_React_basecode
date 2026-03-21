import { usePage } from '@inertiajs/react';
import { AppSidebar } from '@/components/app-sidebar';
import type { NavItem } from '@/components/app-sidebar';
import Header from '@/components/header/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CENTRAL_NAV } from '@/config/central-nav';
import type { CentralNavItem } from '@/config/central-nav';

// ── Central nav — fully static, no permission filtering needed ────────────────
// All central users who reach this layout are already verified admins.

function buildCentralNav(
    items: CentralNavItem[],
    currentUrl: string,
): NavItem[] {
    return items.map(
        (item): NavItem => ({
            title: item.title,
            url: item.url,
            icon: item.icon,
            isActive: currentUrl === item.url,
            // Filter children too
            items: item.items,
        }),
    );

    // return
}

export default function AppLayout({
    children,
    fullLayout = false,
}: {
    children: React.ReactNode;
    fullLayout?: boolean;
}) {
    const { url } = usePage().props as { url: string };

    const navItems = buildCentralNav(CENTRAL_NAV, url ?? '');

    return (
        <SidebarProvider>
            <AppSidebar navMain={navItems} />
            <SidebarInset>
                <Header />
                <div className={`${!fullLayout ? 'p-4' : ''}`}>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}

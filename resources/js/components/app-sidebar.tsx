// import { router } from '@inertiajs/react';
// import * as React from 'react';

// import {
//     Sidebar,
//     SidebarContent,
//     SidebarHeader,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
//     SidebarRail,
//     useSidebar,
// } from '@/components/ui/sidebar';
// import { chatPage, dashboard } from '@/routes/central';
// import { index as ModuleIndex } from '@/routes/central/modules';
// import { index as SubscriptionIndex } from '@/routes/central/subscription-packages';
// import { index as AdminTenantIndex } from '@/routes/central/tenants';
// import { NavMain } from './nav-main';

// // This is sample data.
// const data = {
//     navMain: [
//         {
//             title: 'Dashboard',
//             url: dashboard.url(),
//         },
//         {
//             title: 'Chat',
//             url: chatPage.url(),
//         },
//         {
//             title: 'Subscription',
//             url: SubscriptionIndex.url(),
//         },
//         {
//             title: 'Module',
//             url: ModuleIndex.url(),
//         },
//         {
//             title: 'Tenant',
//             url: AdminTenantIndex.url(),
//         },
//         {
//             title: 'Settings',
//             url: '#',
//             items: [
//                 {
//                     title: 'General Setting',
//                     url: '#',
//                 },
//                 {
//                     title: 'Project Structure',
//                     url: '#',
//                 },
//             ],
//         },
//         {
//             title: 'Build Your Application',
//             url: '#',
//         },
//     ],
// };

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//     const { setOpenMobile, isMobile } = useSidebar();

//     React.useEffect(() => {
//         const unsubscribe = router.on('navigate', () => {
//             if (isMobile) {
//                 setOpenMobile(false);
//             }
//         });
//         return () => unsubscribe();
//     }, [isMobile, setOpenMobile]);

//     return (
//         <Sidebar {...props}>
//             <SidebarHeader className="py-4">
//                 <SidebarMenu>
//                     <SidebarMenuItem>
//                         <SidebarMenuButton
//                             asChild
//                             className="data-[slot=sidebar-menu-button]:p-1.5!"
//                         >
//                             <a href="#">
//                                 <img
//                                     src="https://www.emmitone.com/assets/img/logo_2.png"
//                                     className="p-4"
//                                     alt=""
//                                 />
//                             </a>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 </SidebarMenu>
//             </SidebarHeader>
//             <SidebarContent className="gap-0">
//                 <NavMain items={data.navMain} />
//             </SidebarContent>
//             <SidebarRail />
//         </Sidebar>
//     );
// }

import { router } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
    }[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navMain: NavItem[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AppSidebar({ navMain, ...props }: AppSidebarProps) {
    const { setOpenMobile, isMobile } = useSidebar();

    // Close mobile sidebar on navigation
    React.useEffect(() => {
        const unsubscribe = router.on('navigate', () => {
            if (isMobile) setOpenMobile(false);
        });
        return () => unsubscribe();
    }, [isMobile, setOpenMobile]);

    return (
        <Sidebar {...props}>
            <SidebarHeader className="py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href="#">
                                <img
                                    src="https://www.emmitone.com/assets/img/logo_2.png"
                                    className="p-4"
                                    alt=""
                                />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                <NavMain items={navMain} />
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}

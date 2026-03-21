// resources/js/types/index.d.ts

export interface Auth {
    user: {
        id: number;
        name: string;
        email: string;
        must_change_password: boolean;
    };
}

export interface SidebarModule {
    slug: string;
    name: string;
    group: string | null;
    icon: string | null;
    actions: string[];
}

// ✅ This is what TenantLayout imports
export type PermissionsMap = Record<string, string[]>;

declare module '@inertiajs/core' {
    interface PageProps {
        auth: Auth;
        permissions: PermissionsMap;
        sidebarModules: SidebarModule[];
        sidebarOpen: boolean;
        name: string;
        url: string; // ← add this too for isActive detection
    }
}

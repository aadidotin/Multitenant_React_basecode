import { usePage } from '@inertiajs/react';

type PermissionsMap = Record<string, string[]>;

/**
 * Hook for checking tenant module permissions in React components.
 *
 * Usage:
 *   const { can, hasModule, actionsFor } = useModulePermission();
 *
 *   can('invoices', 'create')   // true/false
 *   hasModule('invoices')       // true/false
 *   actionsFor('invoices')      // ['create', 'read', 'update']
 */
export function useModulePermission() {
    const { permissions } = usePage().props as unknown as { permissions: PermissionsMap };

    const can = (moduleSlug: string, action: string): boolean =>
        permissions?.[moduleSlug]?.includes(action) ?? false;

    const hasModule = (moduleSlug: string): boolean =>
        moduleSlug in (permissions ?? {});

    const actionsFor = (moduleSlug: string): string[] =>
        permissions?.[moduleSlug] ?? [];

    const canAny = (moduleSlug: string, actions: string[]): boolean =>
        actions.some((a) => can(moduleSlug, a));

    const canAll = (moduleSlug: string, actions: string[]): boolean =>
        actions.every((a) => can(moduleSlug, a));

    return { can, hasModule, actionsFor, canAny, canAll, permissions };
}

/**
 * Gate component — renders children only if user has the permission.
 *
 * <Can module="invoices" action="create">
 *   <CreateButton />
 * </Can>
 */
export function Can({
    module,
    action,
    fallback = null,
    children,
}: {
    module: string;
    action: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { can } = useModulePermission();
    return can(module, action) ? <>{children}</> : <>{fallback}</>;
}

/**
 * HasModule component — renders children only if module is accessible.
 *
 * <HasModule slug="analytics">
 *   <AnalyticsDashboard />
 * </HasModule>
 */
export function HasModule({
    slug,
    fallback = null,
    children,
}: {
    slug: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { hasModule } = useModulePermission();
    return hasModule(slug) ? <>{children}</> : <>{fallback}</>;
}
// resources/js/Pages/Tenant/Roles/Create.tsx
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2, Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import TenantLayout from '@/layouts/TenantLayout';
import {
    index as TenantRoleIndex,
    update as TenantRoleUpdate,
    store as TenantRoleStore,
} from '@/routes/tenant/roles';

interface ModuleOption {
    slug: string;
    name: string;
    group: string | null;
    icon: string | null;
    actions: string[];    // only actions the tenant's package allows
}

interface AssignedAction {
    module_slug: string;
    action_key: string;
}

interface RoleData {
    id?: number;
    name: string;
    description: string | null;
    is_active: boolean;
    is_system: boolean;
}

interface Props {
    modules: ModuleOption[];
    role?: RoleData;
    assignedActions?: AssignedAction[];
}

// ── Action label formatting ───────────────────────────────────────────────────
const ACTION_COLORS: Record<string, string> = {
    create : 'text-emerald-700 bg-emerald-50 border-emerald-200',
    read   : 'text-blue-700 bg-blue-50 border-blue-200',
    update : 'text-amber-700 bg-amber-50 border-amber-200',
    delete : 'text-red-700 bg-red-50 border-red-200',
    export : 'text-purple-700 bg-purple-50 border-purple-200',
};

// ── Permission matrix ─────────────────────────────────────────────────────────
function RolePermissionMatrix({
    modules,
    selected,
    onChange,
    readonly = false,
}: {
    modules: ModuleOption[];
    selected: AssignedAction[];
    onChange: (actions: AssignedAction[]) => void;
    readonly?: boolean;
}) {
    const isSelected = (moduleSlug: string, actionKey: string) =>
        selected.some((a) => a.module_slug === moduleSlug && a.action_key === actionKey);

    const toggle = (moduleSlug: string, actionKey: string) => {
        if (readonly) return;
        const exists = isSelected(moduleSlug, actionKey);
        onChange(
            exists
                ? selected.filter((a) => !(a.module_slug === moduleSlug && a.action_key === actionKey))
                : [...selected, { module_slug: moduleSlug, action_key: actionKey }]
        );
    };

    const toggleModule = (mod: ModuleOption) => {
        if (readonly) return;
        const allSelected = mod.actions.every((a) => isSelected(mod.slug, a));
        if (allSelected) {
            onChange(selected.filter((a) => a.module_slug !== mod.slug));
        } else {
            const existing = selected.filter((a) => a.module_slug !== mod.slug);
            const added    = mod.actions.map((a) => ({ module_slug: mod.slug, action_key: a }));
            onChange([...existing, ...added]);
        }
    };

    const grouped = modules.reduce<Record<string, ModuleOption[]>>((acc, mod) => {
        const g = mod.group ?? 'Other';
        (acc[g] ??= []).push(mod);
        return acc;
    }, {});

    const totalSelected = selected.length;
    const totalAvailable = modules.reduce((sum, m) => sum + m.actions.length, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Select which actions this role can perform on each module.
                </p>
                <Badge variant="outline">{totalSelected} / {totalAvailable} selected</Badge>
            </div>

            {Object.entries(grouped).map(([group, mods]) => (
                <div key={group}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        {group}
                    </p>
                    <div className="space-y-3">
                        {mods.map((mod) => {
                            const selectedCount = mod.actions.filter((a) => isSelected(mod.slug, a)).length;
                            const allChecked    = selectedCount === mod.actions.length && mod.actions.length > 0;
                            const partial       = selectedCount > 0 && !allChecked;

                            return (
                                <div key={mod.slug} className="rounded-lg border bg-card p-4">
                                    {/* Module header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {!readonly && (
                                            <Checkbox
                                                checked={allChecked}
                                                className={partial ? 'opacity-60' : ''}
                                                onCheckedChange={() => toggleModule(mod)}
                                            />
                                        )}
                                        <span className="font-semibold text-sm flex-1">{mod.name}</span>
                                        {selectedCount > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {selectedCount}/{mod.actions.length}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pl-7">
                                        {mod.actions.map((action) => {
                                            const checked = isSelected(mod.slug, action);
                                            const color   = ACTION_COLORS[action] ?? 'text-slate-600 bg-slate-50 border-slate-200';

                                            return (
                                                <label
                                                    key={action}
                                                    className={`flex items-center gap-1.5 cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all
                                                        ${checked ? color : 'border-border text-muted-foreground hover:border-primary/40'}
                                                        ${readonly ? 'cursor-default' : ''}
                                                    `}
                                                >
                                                    {!readonly && (
                                                        <Checkbox
                                                            checked={checked}
                                                            className="h-3 w-3"
                                                            onCheckedChange={() => toggle(mod.slug, action)}
                                                        />
                                                    )}
                                                    {checked && readonly && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                                                    <span className="capitalize">{action}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RoleForm({ modules, role, assignedActions = [] }: Props) {
    const isEditing = !!role;

    const { data, setData, post, put, processing, errors } = useForm({
        name        : role?.name ?? '',
        description : role?.description ?? '',
        is_active   : role?.is_active ?? true,
        actions     : assignedActions as AssignedAction[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && role!.id) {
            put(TenantRoleUpdate.url(role.id));
        } else {
            post(TenantRoleStore.url());
        }
    };

    return (
        <TenantLayout>
            <Head title={isEditing ? `Edit ${role!.name}` : 'New Role'} />

            <div className="max-w-3xl space-y-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={TenantRoleIndex.url()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Roles
                    </Link>
                </Button>

                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? `Edit "${role!.name}"` : 'Create Role'}
                        </h1>
                        {role?.is_system && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Lock className="h-3 w-3" /> System Role
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Permissions are limited to your subscription plan's allowed modules.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role details — hidden for system roles */}
                    {!role?.is_system && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Role Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Name *</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Sales Manager"
                                    />
                                    {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Description</Label>
                                    <Textarea
                                        rows={2}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="What is this role responsible for?"
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Active</p>
                                        <p className="text-xs text-muted-foreground">Inactive roles cannot be assigned to users.</p>
                                    </div>
                                    <Switch
                                        checked={data.is_active}
                                        onCheckedChange={(v) => setData('is_active', v)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Permission matrix */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Module Permissions</CardTitle>
                            <CardDescription>
                                Only modules included in your subscription plan are shown.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RolePermissionMatrix
                                modules={modules}
                                selected={data.actions}
                                onChange={(actions) => setData('actions', actions)}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Role'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={TenantRoleIndex.url()}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </TenantLayout>
    );
}
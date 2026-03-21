import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout';
import {
    index as SubscriptionIndex,
    store as SubscriptionStore,
    update as SubscriptionUpdate,
} from '@/routes/central/subscription-packages';

interface ModuleAction {
    id: number;
    name: string;
    key: string;
    is_active: boolean;
}

interface Module {
    id: number;
    name: string;
    slug: string;
    group: string | null;
    icon: string | null;
    actions: ModuleAction[];
}

interface Package {
    id?: number;
    name: string;
    slug: string;
    description: string;
    price: string | number;
    billing_cycle: string;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    package?: Package;
    modules: Module[];
    allowedActionIds?: number[];
}

// ── Reusable permission matrix ─────────────────────────────────────────────────
function ModulePermissionMatrix({
    modules,
    selectedIds,
    onChange,
}: {
    modules: Module[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}) {
    const toggle = (id: number) => {
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter((x) => x !== id)
                : [...selectedIds, id],
        );
    };

    const toggleAll = (actionIds: number[]) => {
        const allSelected = actionIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            onChange(selectedIds.filter((id) => !actionIds.includes(id)));
        } else {
            const merged = Array.from(new Set([...selectedIds, ...actionIds]));
            onChange(merged);
        }
    };

    const grouped = modules.reduce<Record<string, Module[]>>((acc, mod) => {
        const g = mod.group ?? 'Other';
        (acc[g] ??= []).push(mod);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([group, mods]) => (
                <div key={group}>
                    <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        {group}
                    </p>
                    <div className="space-y-3">
                        {mods.map((mod) => {
                            const activeActions = mod.actions.filter(
                                (a) => a.is_active,
                            );
                            const allIds = activeActions.map((a) => a.id);
                            const selectedCount = allIds.filter((id) =>
                                selectedIds.includes(id),
                            ).length;
                            const allChecked =
                                selectedCount === allIds.length &&
                                allIds.length > 0;
                            const partialChecked =
                                selectedCount > 0 && !allChecked;

                            return (
                                <div
                                    key={mod.id}
                                    className="rounded-lg border bg-card p-4"
                                >
                                    {/* Module header row */}
                                    <div className="mb-3 flex items-center gap-3">
                                        <Checkbox
                                            id={`mod-${mod.id}`}
                                            checked={allChecked}
                                            data-state={
                                                partialChecked
                                                    ? 'indeterminate'
                                                    : undefined
                                            }
                                            onCheckedChange={() =>
                                                toggleAll(allIds)
                                            }
                                            className={
                                                partialChecked
                                                    ? 'opacity-70'
                                                    : ''
                                            }
                                        />
                                        <Label
                                            htmlFor={`mod-${mod.id}`}
                                            className="flex-1 cursor-pointer font-semibold"
                                        >
                                            {mod.name}
                                        </Label>
                                        {selectedCount > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {selectedCount}/{allIds.length}{' '}
                                                selected
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Actions grid */}
                                    {activeActions.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2 pl-7 sm:grid-cols-3 md:grid-cols-4">
                                            {activeActions.map((action) => (
                                                <label
                                                    key={action.id}
                                                    className="group flex cursor-pointer items-center gap-2"
                                                >
                                                    <Checkbox
                                                        checked={selectedIds.includes(
                                                            action.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggle(action.id)
                                                        }
                                                    />
                                                    <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                                                        {action.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="pl-7 text-xs text-muted-foreground">
                                            No active actions.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
function SubscriptionForm({
    package: pkg,
    modules,
    allowedActionIds = [],
}: Props) {
    const isEditing = !!pkg;

    const { data, setData, post, put, processing, errors } = useForm({
        name: pkg?.name ?? '',
        slug: pkg?.slug ?? '',
        description: pkg?.description ?? '',
        price: pkg?.price ?? '',
        billing_cycle: pkg?.billing_cycle ?? 'monthly',
        is_active: pkg?.is_active ?? true,
        sort_order: pkg?.sort_order ?? 0,
        action_ids: allowedActionIds as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && pkg?.id) {
            put(SubscriptionUpdate.url(pkg.id));
        } else {
            post(SubscriptionStore.url());
        }
    };

    const autoSlug = (name: string) =>
        name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

    const totalSelected = data.action_ids.length;
    const totalAvailable = modules.flatMap((m) =>
        m.actions.filter((a) => a.is_active),
    ).length;

    return (
        <>
            <Head title={isEditing ? `Edit ${pkg!.name}` : 'New Package'} />

            <div className="space-y-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={SubscriptionIndex.url()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back to
                        Packages
                    </Link>
                </Button>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-5 xl:grid-cols-12"
                >
                    {/* ── Plan Details ─────────────────────────────────────── */}
                    <Card className="top-16 h-fit xl:sticky xl:col-span-5">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Plan Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label>Name *</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => {
                                            setData('name', e.target.value);
                                            if (!isEditing)
                                                setData(
                                                    'slug',
                                                    autoSlug(e.target.value),
                                                );
                                        }}
                                        placeholder="e.g. Starter"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Price *</Label>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                            $
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData('price', e.target.value)
                                            }
                                            className="pl-7"
                                            placeholder="29.00"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="text-xs text-destructive">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Billing Cycle *</Label>
                                    <Select
                                        value={data.billing_cycle}
                                        onValueChange={(v) =>
                                            setData('billing_cycle', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">
                                                Monthly
                                            </SelectItem>
                                            <SelectItem value="yearly">
                                                Yearly
                                            </SelectItem>
                                            <SelectItem value="lifetime">
                                                Lifetime
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Textarea
                                    rows={2}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Short description shown to customers."
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Active
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Inactive packages are hidden from
                                        signup.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', v)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Module Permissions ───────────────────────────────── */}
                    <Card className="xl:col-span-7">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">
                                        Module Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        Select which actions subscribers on this
                                        plan can perform.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">
                                    {totalSelected} / {totalAvailable} selected
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ModulePermissionMatrix
                                modules={modules}
                                selectedIds={data.action_ids}
                                onChange={(ids) => setData('action_ids', ids)}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 xl:col-span-12">
                        <Button variant="outline" asChild>
                            <Link href={SubscriptionIndex.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Save Changes' : 'Create Package'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

SubscriptionForm.layout = (page: React.ReactNode) => (
    <AppLayout children={page} />
);

export default SubscriptionForm;

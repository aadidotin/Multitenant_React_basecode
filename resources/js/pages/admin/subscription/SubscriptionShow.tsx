// resources/js/Pages/Admin/SubscriptionPackages/Show.tsx
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Check, X, Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import {
    index as SubscriptionIndex,
    edit as SubscriptionEdit,
} from '@/routes/central/subscription-packages';

interface ModuleAction {
    id: number;
    name: string;
    key: string;
    module: {
        id: number;
        name: string;
        group: string | null;
    };
}

interface Package {
    id: number;
    name: string;
    price: string;
    billing_cycle: string;
    description: string | null;
    is_active: boolean;
    module_actions: ModuleAction[];
}

interface Module {
    id: number;
    name: string;
    slug: string;
    group: string | null;
    actions: { id: number; name: string; key: string; is_active: boolean }[];
}

interface Props {
    package: Package;
    modules: Module[];
    allowedActionIds: number[];
}

const cycleLabel: Record<string, string> = {
    monthly: '/mo',
    yearly: '/yr',
    lifetime: ' once',
};

function SubscriptionShow({ package: pkg, modules, allowedActionIds }: Props) {
    const allowed = new Set(allowedActionIds);

    const grouped = modules.reduce<Record<string, Module[]>>((acc, mod) => {
        const g = mod.group ?? 'Other';
        (acc[g] ??= []).push(mod);
        return acc;
    }, {});

    return (
        <>
            <Head title={pkg.name} />

            <div className="max-w-3xl space-y-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={SubscriptionIndex.url()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {pkg.name}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-xl font-semibold">
                                ${Number(pkg.price).toFixed(2)}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {cycleLabel[pkg.billing_cycle]}
                                </span>
                            </span>
                            {pkg.is_active ? (
                                <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                        {pkg.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {pkg.description}
                            </p>
                        )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={SubscriptionEdit.url(pkg.id)}>
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>

                {/* Permission Matrix */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Allowed Module Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(grouped).map(([group, mods]) => (
                            <div key={group}>
                                <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                    {group}
                                </p>
                                <div className="space-y-2">
                                    {mods.map((mod) => {
                                        const activeActions =
                                            mod.actions.filter(
                                                (a) => a.is_active,
                                            );
                                        const grantedCount =
                                            activeActions.filter((a) =>
                                                allowed.has(a.id),
                                            ).length;

                                        return (
                                            <div
                                                key={mod.id}
                                                className="rounded-lg border p-3"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="text-sm font-medium">
                                                        {mod.name}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {grantedCount}/
                                                        {activeActions.length}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                                    {activeActions.map(
                                                        (action) => {
                                                            const granted =
                                                                allowed.has(
                                                                    action.id,
                                                                );
                                                            return (
                                                                <div
                                                                    key={
                                                                        action.id
                                                                    }
                                                                    className={`flex items-center gap-1.5 rounded px-2 py-1 text-sm ${
                                                                        granted
                                                                            ? 'bg-emerald-50 text-emerald-700'
                                                                            : 'bg-muted/50 text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {granted ? (
                                                                        <Check className="h-3.5 w-3.5 shrink-0" />
                                                                    ) : (
                                                                        <X className="h-3.5 w-3.5 shrink-0" />
                                                                    )}
                                                                    {
                                                                        action.name
                                                                    }
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SubscriptionShow.layout = (page: React.ReactNode) => (
    <AppLayout children={page} />
);

export default SubscriptionShow;

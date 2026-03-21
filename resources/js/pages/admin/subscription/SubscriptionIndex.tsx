// resources/js/Pages/Admin/SubscriptionPackages/Index.tsx
import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import {
    index as SubscriptionPackageIndex,
    show as SubscriptionShow,
    edit as SubscriptionEdit,
    destroy as SubscriptionDestroy,
    create as SubscriptionCreate,
} from '@/routes/central/subscription-packages';
import type { PaginatedData } from '@/types/pagination';

interface Package {
    id: number;
    name: string;
    slug: string;
    price: string;
    billing_cycle: string;
    is_active: boolean;
    module_actions_count: number;
}

interface Props {
    packages: PaginatedData<Package>;
    filters: { search?: string };
}

const cycleLabel: Record<string, string> = {
    monthly: '/mo',
    yearly: '/yr',
    lifetime: ' once',
};

function SubscriptionIndex({ packages, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(SubscriptionDestroy.url(deleteTarget.id), {
            onSuccess: () => toast(`"${deleteTarget.name}" deleted.`),
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Subscription Packages" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Subscription Packages
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Define plans and assign which module actions are
                            available per plan.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={SubscriptionCreate.url()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Package
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search packages…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            router.get(
                                SubscriptionPackageIndex.url(),
                                { search },
                                { preserveState: true },
                            )
                        }
                    />
                </div>

                {/* Cards grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.data.map((pkg) => (
                        <Card key={pkg.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg">
                                        {pkg.name}
                                    </CardTitle>
                                    {pkg.is_active ? (
                                        <Badge className="shrink-0 border-emerald-200 bg-emerald-100 text-emerald-700">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0"
                                        >
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-1 text-2xl font-bold">
                                    ${Number(pkg.price).toFixed(2)}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {cycleLabel[pkg.billing_cycle]}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        {pkg.module_actions_count}
                                    </span>{' '}
                                    module actions enabled
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto flex gap-2 pt-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="flex-1"
                                >
                                    <Link href={SubscriptionShow.url(pkg.id)}>
                                        <Eye className="mr-1 h-3.5 w-3.5" />{' '}
                                        View
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={SubscriptionEdit.url(pkg.id)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTarget(pkg)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {packages.data.length === 0 && (
                        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            No packages found.
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete "{deleteTarget?.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The package and its module assignments will be
                            removed. Subscribers on this plan should be migrated
                            first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="text-destructive-foreground bg-destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

SubscriptionIndex.layout = (page: React.ReactNode) => (
    <AppLayout children={page} />
);

export default SubscriptionIndex;

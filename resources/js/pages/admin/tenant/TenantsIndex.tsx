import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout';
import type { PaginatedData } from '@/types/pagination';
import {
    index as AdminTenantIndex,
    show as AdminTenantShow,
    approve as AdminTenantApprove,
} from '@/routes/central/tenants';

interface Domain {
    domain: string;
}
interface Tenant {
    id: string;
    name: string;
    email: string;
    status: string;
    trial_ends_at: string | null;
    email_verified_at: string | null;
    approved_at: string | null;
    created_at: string;
    domains: Domain[];
}

const STATUS_CONFIG: Record<
    string,
    { label: string; variant: string; Icon: React.ElementType }
> = {
    pending_verification: {
        label: 'Pending Verification',
        variant: 'outline',
        Icon: Clock,
    },
    pending_approval: {
        label: 'Pending Approval',
        variant: 'warning',
        Icon: AlertTriangle,
    },
    active: { label: 'Active', variant: 'success', Icon: CheckCircle },
    suspended: { label: 'Suspended', variant: 'secondary', Icon: XCircle },
    cancelled: { label: 'Cancelled', variant: 'secondary', Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        variant: 'outline',
        Icon: Clock,
    };
    const { label, Icon } = cfg;

    const colorMap: Record<string, string> = {
        pending_verification: 'text-slate-600 border-slate-300 bg-slate-50',
        pending_approval: 'text-amber-700 border-amber-300 bg-amber-50',
        active: 'text-emerald-700 border-emerald-300 bg-emerald-50',
        suspended: 'text-red-600 border-red-300 bg-red-50',
        cancelled: 'text-slate-500 border-slate-200 bg-slate-50',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${colorMap[status] ?? ''}`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

export default function TenantsIndex({
    tenants,
    statusCounts,
    filters,
}: {
    tenants: PaginatedData<Tenant>;
    statusCounts: Record<string, number>;
    filters: { search?: string; status?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [approveTarget, setApproveTarget] = useState<Tenant | null>(null);

    const applyFilter = (overrides: Record<string, string | undefined>) => {
        router.get(
            AdminTenantIndex.url(),
            { search, ...filters, ...overrides },
            { preserveState: true, replace: true },
        );
    };

    const handleApprove = () => {
        if (!approveTarget) return;
        router.post(
            AdminTenantApprove.url(approveTarget.id),
            {},
            {
                onSuccess: () =>
                    toast(
                        `"${approveTarget.name}" approved! Workspace is being set up.`,
                    ),
                onFinish: () => setApproveTarget(null),
            },
        );
    };

    const statusTabs = [
        {
            key: undefined,
            label: 'All',
            count: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        },
        {
            key: 'pending_approval',
            label: 'Pending Approval',
            count: statusCounts['pending_approval'] ?? 0,
        },
        { key: 'active', label: 'Active', count: statusCounts['active'] ?? 0 },
        {
            key: 'pending_verification',
            label: 'Unverified',
            count: statusCounts['pending_verification'] ?? 0,
        },
        {
            key: 'suspended',
            label: 'Suspended',
            count: statusCounts['suspended'] ?? 0,
        },
    ];

    return (
        <AppLayout>
            <Head title="Tenants" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Tenants
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage tenant registrations, approvals, and workspace
                        status.
                    </p>
                </div>

                {/* Status tabs */}
                <div className="flex flex-wrap gap-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key ?? 'all'}
                            onClick={() => applyFilter({ status: tab.key })}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                filters.status === tab.key ||
                                (!filters.status && !tab.key)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-xs ${
                                    filters.status === tab.key ||
                                    (!filters.status && !tab.key)
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-background'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && applyFilter({ search })
                        }
                    />
                </div>

                {/* Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Workspace URL</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Trial Ends</TableHead>
                                <TableHead>Registered</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.data.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {tenant.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {tenant.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs text-muted-foreground">
                                            {tenant.domains[0]?.domain ?? '—'}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={tenant.status} />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {tenant.trial_ends_at
                                            ? new Date(
                                                  tenant.trial_ends_at,
                                              ).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(
                                            tenant.created_at,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            {tenant.status ===
                                                'pending_approval' && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="h-7 text-xs"
                                                    onClick={() =>
                                                        setApproveTarget(tenant)
                                                    }
                                                >
                                                    <CheckCircle className="mr-1 h-3 w-3" />{' '}
                                                    Approve
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7"
                                                asChild
                                            >
                                                <Link
                                                    href={AdminTenantShow.url(
                                                        tenant.id,
                                                    )}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tenants.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No tenants found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Approve dialog */}
            <AlertDialog
                open={!!approveTarget}
                onOpenChange={() => setApproveTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Approve "{approveTarget?.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will provision their dedicated database, run
                            migrations, and send them an activation email. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>
                            Approve & Provision
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

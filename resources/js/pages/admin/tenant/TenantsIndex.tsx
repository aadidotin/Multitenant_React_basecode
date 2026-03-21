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
import {
    index as AdminTenantIndex,
    show as AdminTenantShow,
    approve as AdminTenantApprove,
} from '@/routes/central/tenants';
import type { PaginatedData } from '@/types/pagination';

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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Tenants
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage tenant registrations, approvals, and workspace
                            status.
                        </p>
                    </div>
                </div>

                {/* Status tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key ?? 'all'}
                            onClick={() => applyFilter({ status: tab.key })}
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                filters.status === tab.key ||
                                (!filters.status && !tab.key)
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    filters.status === tab.key ||
                                    (!filters.status && !tab.key)
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-muted-foreground/20 text-muted-foreground'
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
                        className="pl-9 transition-colors focus:border-ring"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && applyFilter({ search })
                        }
                    />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Tenant</TableHead>
                                <TableHead className="font-semibold">Workspace URL</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Trial Ends</TableHead>
                                <TableHead className="font-semibold">Registered</TableHead>
                                <TableHead className="w-[80px] text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.data.map((tenant) => (
                                <TableRow key={tenant.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <p className="font-medium text-slate-900">
                                                {tenant.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {tenant.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                            {tenant.domains[0]?.domain ?? '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={tenant.status} />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {tenant.trial_ends_at
                                            ? new Date(
                                                  tenant.trial_ends_at,
                                              ).toLocaleDateString()
                                            : <span className="text-slate-300">—</span>}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(
                                            tenant.created_at,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1.5">
                                            {tenant.status ===
                                                'pending_approval' && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="h-8 gap-1"
                                                    onClick={() =>
                                                        setApproveTarget(tenant)
                                                    }
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    <span>Approve</span>
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                asChild
                                            >
                                                <Link
                                                    href={AdminTenantShow.url(
                                                        tenant.id,
                                                    )}
                                                >
                                                    <Eye className="h-4 w-4" />
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
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="rounded-full bg-muted p-3">
                                                <Search className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                No tenants found
                                            </p>
                                        </div>
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

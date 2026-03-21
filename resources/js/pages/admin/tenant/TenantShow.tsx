// resources/js/Pages/Admin/Tenants/Show.tsx
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Building2,
    Globe,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ShieldCheck,
    Loader2,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout';
import {
    suspend as AdminTenantSuspended,
    approve as AdminTenantApprove,
    index as AdminTenantIndex,
} from '@/routes/central/tenants';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Domain {
    id: number;
    domain: string;
    type: 'subdomain' | 'custom';
    is_primary: boolean;
}

interface SubscriptionPackage {
    id: number;
    name: string;
    price: string;
    billing_cycle: string;
}

interface ApprovedBy {
    id: number;
    name: string;
    email: string;
}

interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    status: string;
    trial_ends_at: string | null;
    email_verified_at: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    domains: Domain[];
    subscription_package: SubscriptionPackage | null;
    approved_by: ApprovedBy | null;
}

interface Props {
    tenant: Tenant;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        icon: React.ElementType;
        colors: string;
        description: string;
    }
> = {
    pending_verification: {
        label: 'Pending Verification',
        icon: Clock,
        colors: 'text-slate-600 border-slate-300 bg-slate-50',
        description:
            'Tenant has registered but not yet verified their email address.',
    },
    pending_approval: {
        label: 'Pending Approval',
        icon: AlertTriangle,
        colors: 'text-amber-700 border-amber-300 bg-amber-50',
        description:
            'Email verified. Waiting for admin approval to provision workspace.',
    },
    active: {
        label: 'Active',
        icon: CheckCircle,
        colors: 'text-emerald-700 border-emerald-300 bg-emerald-50',
        description: 'Workspace is live and accessible.',
    },
    suspended: {
        label: 'Suspended',
        icon: XCircle,
        colors: 'text-red-600 border-red-300 bg-red-50',
        description: 'Workspace has been suspended and is inaccessible.',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        colors: 'text-slate-500 border-slate-200 bg-slate-50',
        description: 'Tenant has cancelled their account.',
    },
};

// ── Helper components ─────────────────────────────────────────────────────────

function InfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <span className="w-36 shrink-0 text-sm text-muted-foreground">
                {label}
            </span>
            <span
                className={`text-right text-sm ${mono ? 'font-mono' : 'font-medium'} text-foreground`}
            >
                {value ?? (
                    <span className="font-normal text-muted-foreground">—</span>
                )}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return <Badge variant="outline">{status}</Badge>;
    const { label, icon: Icon, colors } = cfg;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium ${colors}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}

function formatDate(date: string | null, fallback = '—') {
    if (!date) return fallback;
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatDatetime(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ── Suspend dialog with reason ────────────────────────────────────────────────

function SuspendDialog({
    tenant,
    open,
    onClose,
}: {
    tenant: Tenant;
    open: boolean;
    onClose: () => void;
}) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = () => {
        setLoading(true);
        router.post(
            AdminTenantSuspended.url(tenant.id),
            { reason },
            {
                onSuccess: () => {
                    toast(`"${tenant.name}" has been suspended.`);
                    onClose();
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Suspend "{tenant.name}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Their workspace will become immediately inaccessible to
                        all users. You can reactivate them at any time.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-1.5 px-0">
                    <Label>Reason (optional)</Label>
                    <Textarea
                        rows={3}
                        placeholder="e.g. Payment overdue, terms violation…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                        onClick={handle}
                        disabled={loading}
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Suspend Workspace
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TenantShow({ tenant }: Props) {
    const [approveOpen, setApproveOpen] = useState(false);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [approving, setApproving] = useState(false);

    const statusCfg = STATUS_CONFIG[tenant.status];
    const primaryDomain = tenant.domains.find((d) => d.is_primary);
    const trialDaysLeft = tenant.trial_ends_at
        ? Math.max(
              0,
              Math.ceil(
                  // eslint-disable-next-line react-hooks/purity
                  (new Date(tenant.trial_ends_at).getTime() - Date.now()) /
                      86_400_000,
              ),
          )
        : null;

    const handleApprove = () => {
        setApproving(true);
        router.post(
            AdminTenantApprove.url(tenant.id),
            {},
            {
                onSuccess: () => {
                    toast(
                        `"${tenant.name}" approved! Workspace is being provisioned.`,
                    );
                    setApproveOpen(false);
                },
                onFinish: () => setApproving(false),
            },
        );
    };

    return (
        <AppLayout>
            <Head title={tenant.name} />

            <div className="max-w-4xl space-y-6">
                {/* Back */}
                <Button variant="ghost" size="sm" asChild>
                    <Link href={AdminTenantIndex.url()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Tenants
                    </Link>
                </Button>

                {/* ── Page header ───────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {tenant.name}
                            </h1>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <StatusBadge status={tenant.status} />
                                {primaryDomain && (
                                    <a
                                        href={`https://${primaryDomain.domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        <Globe className="h-3 w-3" />
                                        {primaryDomain.domain}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 gap-2">
                        {tenant.status === 'pending_approval' && (
                            <Button onClick={() => setApproveOpen(true)}>
                                <ShieldCheck className="mr-1.5 h-4 w-4" />
                                Approve & Provision
                            </Button>
                        )}
                        {tenant.status === 'active' && (
                            <Button
                                variant="outline"
                                className="border-destructive/30 text-destructive hover:bg-destructive/5"
                                onClick={() => setSuspendOpen(true)}
                            >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Suspend
                            </Button>
                        )}
                        {tenant.status === 'suspended' && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    router.post(
                                        AdminTenantApprove.url(tenant.id),
                                        {},
                                        {
                                            onSuccess: () =>
                                                toast('Tenant reactivated.'),
                                        },
                                    );
                                }}
                            >
                                <CheckCircle className="mr-1.5 h-4 w-4" />
                                Reactivate
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Status alert banner ───────────────────────────────── */}
                {statusCfg && (
                    <div
                        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${statusCfg.colors}`}
                    >
                        <statusCfg.icon className="h-4 w-4 shrink-0" />
                        {statusCfg.description}
                    </div>
                )}

                {/* ── Main grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* Left column — details */}
                    <div className="space-y-5 lg:col-span-2">
                        {/* Company details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Company Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                <InfoRow
                                    label="Company Name"
                                    value={tenant.name}
                                />
                                <InfoRow
                                    label="Email"
                                    value={
                                        <a
                                            href={`mailto:${tenant.email}`}
                                            className="text-primary hover:underline"
                                        >
                                            {tenant.email}
                                        </a>
                                    }
                                />
                                <InfoRow label="Phone" value={tenant.phone} />
                                <InfoRow
                                    label="Address"
                                    value={tenant.address}
                                />
                                <InfoRow label="City" value={tenant.city} />
                                <InfoRow
                                    label="Country"
                                    value={tenant.country}
                                />
                            </CardContent>
                        </Card>

                        {/* Domains */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    Domains
                                </CardTitle>
                                <CardDescription>
                                    Configured access points for this workspace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {tenant.domains.length > 0 ? (
                                    tenant.domains.map((domain) => (
                                        <div
                                            key={domain.id}
                                            className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5"
                                        >
                                            <div className="flex items-center gap-2">
                                                <code className="font-mono text-sm">
                                                    {domain.domain}
                                                </code>
                                                {domain.is_primary && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs capitalize"
                                            >
                                                {domain.type}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No domains configured.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column — meta */}
                    <div className="space-y-5">
                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-3 text-sm">
                                    <TimelineItem
                                        label="Registered"
                                        value={formatDatetime(
                                            tenant.created_at,
                                        )}
                                        done
                                    />
                                    <TimelineItem
                                        label="Email Verified"
                                        value={formatDatetime(
                                            tenant.email_verified_at,
                                        )}
                                        done={!!tenant.email_verified_at}
                                    />
                                    <TimelineItem
                                        label="Approved"
                                        value={
                                            tenant.approved_at
                                                ? `${formatDatetime(tenant.approved_at)}${tenant.approved_by ? ` by ${tenant.approved_by.name}` : ''}`
                                                : undefined
                                        }
                                        done={!!tenant.approved_at}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trial */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Trial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {tenant.trial_ends_at ? (
                                    <>
                                        <div className="py-2 text-center">
                                            <p
                                                className={`text-3xl font-bold ${trialDaysLeft === 0 ? 'text-destructive' : trialDaysLeft! <= 3 ? 'text-amber-600' : 'text-foreground'}`}
                                            >
                                                {trialDaysLeft}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                days remaining
                                            </p>
                                        </div>
                                        <Separator />
                                        <p className="text-center text-xs text-muted-foreground">
                                            Ends{' '}
                                            {formatDate(tenant.trial_ends_at)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Trial starts upon approval.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Subscription */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Subscription
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {tenant.subscription_package ? (
                                    <div className="space-y-1">
                                        <p className="font-semibold">
                                            {tenant.subscription_package.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            $
                                            {Number(
                                                tenant.subscription_package
                                                    .price,
                                            ).toFixed(2)}
                                            <span className="text-xs">
                                                /
                                                {tenant.subscription_package
                                                    .billing_cycle === 'monthly'
                                                    ? 'mo'
                                                    : tenant
                                                            .subscription_package
                                                            .billing_cycle ===
                                                        'yearly'
                                                      ? 'yr'
                                                      : 'once'}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            No package assigned yet.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link href={AdminTenantIndex.url()}>
                                                Assign Package
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── Approve dialog ─────────────────────────────────────────── */}
            <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Approve "{tenant.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will provision a dedicated database for their
                            workspace, run migrations, seed initial data, and
                            send them an activation email. Their 14-day trial
                            will start now.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={approving}
                        >
                            {approving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Approve & Provision
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Suspend dialog ─────────────────────────────────────────── */}
            <SuspendDialog
                tenant={tenant}
                open={suspendOpen}
                onClose={() => setSuspendOpen(false)}
            />
        </AppLayout>
    );
}

// ── Timeline item ─────────────────────────────────────────────────────────────
function TimelineItem({
    label,
    value,
    done,
}: {
    label: string;
    value?: string;
    done: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30 bg-transparent'}`}
            >
                {done && <Check className="h-2.5 w-2.5 text-white" />}
            </div>
            <div>
                <p
                    className={`text-xs font-medium ${done ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                    {label}
                </p>
                {value && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
}

// Need to import Check for the timeline
function Check({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

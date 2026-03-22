import { Head, Link, router } from '@inertiajs/react';
import {
    UserPlus,
    Settings,
    CheckCircle,
    XCircle,
    Ban,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search,
    CheckCircle2,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import TenantLayout from '@/layouts/TenantLayout';
import {
    index,
    create,
    edit,
    destroy,
    review,
    settings as settingsRoute,
} from '@/routes/tenant/users';

// ── Types ─────────────────────────────────────────────────────────────────────

type UserStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    registration_type: 'authenticated' | 'self_registered';
    phone: string | null;
    designation: string | null;
    department: string | null;
    roles: Role[];
    roles_count: number;
    reviewed_at: string | null;
    review_notes: string | null;
    created_at: string;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Counts {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    blocked: number;
}

interface Props {
    users: Paginator<User>;
    counts: Counts;
    currentStatus: string;
    filters?: { search?: string };
}

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    UserStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        Icon: React.ElementType;
    }
> = {
    pending: { label: 'Pending', variant: 'outline', Icon: Clock },
    approved: { label: 'Approved', variant: 'default', Icon: CheckCircle },
    rejected: { label: 'Rejected', variant: 'outline', Icon: XCircle },
    blocked: { label: 'Blocked', variant: 'destructive', Icon: AlertTriangle },
};

const STATUS_COLORS: Record<UserStatus, string> = {
    pending: 'text-amber-700 border-amber-300 bg-amber-50',
    approved: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    rejected: 'text-slate-600 border-slate-300 bg-slate-50',
    blocked: 'text-red-700 border-red-300 bg-red-50',
};

function StatusBadge({ status }: { status: UserStatus }) {
    const cfg = STATUS_CONFIG[status];
    const { label, Icon } = cfg;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

// ── Review modal ──────────────────────────────────────────────────────────────

type ReviewAction = 'approve' | 'reject' | 'block';

interface ReviewTarget {
    user: User;
    action: ReviewAction;
}

const REVIEW_CONFIG: Record<
    ReviewAction,
    {
        title: string;
        description: string;
        confirmLabel: string;
        confirmVariant: 'default' | 'destructive';
        notesLabel: string;
        notesRequired: boolean;
    }
> = {
    approve: {
        title: 'Approve User',
        description: 'The user will be notified and can log in immediately.',
        confirmLabel: 'Approve',
        confirmVariant: 'default',
        notesLabel: 'Optional welcome note',
        notesRequired: false,
    },
    reject: {
        title: 'Reject Application',
        description:
            'The user will be notified that their application was rejected.',
        confirmLabel: 'Reject',
        confirmVariant: 'destructive',
        notesLabel: 'Reason for rejection (sent to applicant)',
        notesRequired: false,
    },
    block: {
        title: 'Block User',
        description:
            'The user will be immediately signed out and cannot log in again.',
        confirmLabel: 'Block',
        confirmVariant: 'destructive',
        notesLabel: 'Reason for blocking (internal only)',
        notesRequired: false,
    },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function UsersIndex({
    users,
    counts,
    currentStatus,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');

    const handleTabChange = (status: string) => {
        router.get(
            index.url(),
            { status, search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleSearch = () => {
        router.get(
            index.url(),
            { search, status: currentStatus || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(destroy.url(deleteTarget.id), {
            onSuccess: () => toast(`"${deleteTarget.name}" deleted.`),
            onFinish: () => setDeleteTarget(null),
        });
    };

    const handleReview = () => {
        if (!reviewTarget) return;
        router.patch(
            review.url(reviewTarget.user.id),
            { action: reviewTarget.action, notes: reviewNotes },
            {
                onSuccess: () =>
                    toast(
                        `"${reviewTarget.user.name}" ${reviewTarget.action}d.`,
                    ),
                onFinish: () => {
                    setReviewTarget(null);
                    setReviewNotes('');
                },
            },
        );
    };

    const statusTabs = [
        {
            key: undefined,
            label: 'All',
            count: Object.values(counts).reduce((a, b) => a + b, 0),
        },
        { key: 'pending', label: 'Pending', count: counts['pending'] ?? 0 },
        { key: 'approved', label: 'Approved', count: counts['approved'] ?? 0 },
        { key: 'rejected', label: 'Rejected', count: counts['rejected'] ?? 0 },
        { key: 'blocked', label: 'Blocked', count: counts['blocked'] ?? 0 },
    ];

    return (
        <TenantLayout>
            <Head title="Users" />

            <div className="space-y-6">
                {/* Header - Responsive */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage workspace members and registration
                            applications.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={settingsRoute.url()}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Registration Settings
                                </span>
                                <span className="sm:hidden">Settings</span>
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={create.url()}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Add User
                                </span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Status tabs - Responsive with wrap */}
                <div className="flex flex-wrap items-center gap-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key ?? 'all'}
                            onClick={() => handleTabChange(tab.key ?? '')}
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                currentStatus === tab.key ||
                                (!currentStatus && !tab.key)
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    currentStatus === tab.key ||
                                    (!currentStatus && !tab.key)
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-muted-foreground/20 text-muted-foreground'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search - Responsive max-width */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9 transition-colors focus:border-ring"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                {/* Table - Responsive with horizontal scroll */}
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">
                                        User
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Email
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Type
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Roles
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Joined
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-slate-900">
                                                    {user.name}
                                                </p>
                                                {user.designation && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.designation}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={user.status} />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.registration_type ===
                                            'self_registered'
                                                ? 'Self-registered'
                                                : 'Admin created'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles
                                                    .slice(0, 2)
                                                    .map((r) => (
                                                        <Badge
                                                            key={r.id}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {r.name}
                                                        </Badge>
                                                    ))}
                                                {user.roles.length > 2 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        +{user.roles.length - 2}
                                                    </Badge>
                                                )}
                                                {user.roles.length === 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {/* Review actions for pending users */}
                                                        {user.status ===
                                                            'pending' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-green-600 focus:text-green-600"
                                                                    onClick={() =>
                                                                        setReviewTarget(
                                                                            {
                                                                                user,
                                                                                action: 'approve',
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setReviewTarget(
                                                                            {
                                                                                user,
                                                                                action: 'reject',
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}

                                                        {/* Block approved users */}
                                                        {user.status ===
                                                            'approved' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        setReviewTarget(
                                                                            {
                                                                                user,
                                                                                action: 'block',
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <Ban className="mr-2 h-4 w-4" />
                                                                    Block
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}

                                                        {/* Re-approve blocked/rejected users */}
                                                        {(user.status ===
                                                            'blocked' ||
                                                            user.status ===
                                                                'rejected') && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-green-600 focus:text-green-600"
                                                                    onClick={() =>
                                                                        setReviewTarget(
                                                                            {
                                                                                user,
                                                                                action: 'approve',
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Re-approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}

                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={edit.url(
                                                                    user.id,
                                                                )}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <div className="rounded-full bg-muted p-3">
                                                    <Search className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    No users found
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination - Responsive */}
                {users.last_page > 1 && (
                    <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                        <p className="text-center text-sm text-muted-foreground sm:text-left">
                            Showing {users.from}–{users.to} of {users.total}
                        </p>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'ghost'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                    className="min-w-[32px]"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete{' '}
                            <strong>{deleteTarget?.name}</strong>? This cannot
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Review confirmation */}
            <AlertDialog
                open={!!reviewTarget}
                onOpenChange={(o) => !o && setReviewTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {reviewTarget &&
                                REVIEW_CONFIG[reviewTarget.action].title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {reviewTarget &&
                                REVIEW_CONFIG[reviewTarget.action].description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 px-1">
                        <Label htmlFor="review-notes" className="text-sm">
                            {reviewTarget &&
                                REVIEW_CONFIG[reviewTarget.action].notesLabel}
                        </Label>
                        <Textarea
                            id="review-notes"
                            placeholder="Optional note..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReviewNotes('')}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReview}
                            className={
                                reviewTarget?.action !== 'approve'
                                    ? 'text-destructive-foreground bg-destructive hover:bg-destructive/90'
                                    : ''
                            }
                        >
                            {reviewTarget &&
                                REVIEW_CONFIG[reviewTarget.action].confirmLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TenantLayout>
    );
}

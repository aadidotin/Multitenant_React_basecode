import { Head, Link, router } from '@inertiajs/react';
import {
    UserPlus,
    Settings,
    CheckCircle2,
    XCircle,
    Ban,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
}

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    UserStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    pending: { label: 'Pending', variant: 'secondary' },
    approved: { label: 'Approved', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'outline' },
    blocked: { label: 'Blocked', variant: 'destructive' },
};

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: { key: string; label: string; countKey: keyof Counts }[] = [
    { key: 'all', label: 'All', countKey: 'all' },
    { key: 'pending', label: 'Pending', countKey: 'pending' },
    { key: 'approved', label: 'Approved', countKey: 'approved' },
    { key: 'rejected', label: 'Rejected', countKey: 'rejected' },
    { key: 'blocked', label: 'Blocked', countKey: 'blocked' },
];

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

export default function UsersIndex({ users, counts, currentStatus }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');

    const handleTabChange = (status: string) => {
        router.get(
            index.url(),
            { status },
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

    return (
        <TenantLayout>
            <Head title="Users" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage workspace members and registration
                            applications.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={settingsRoute.url()}>
                                <Settings className="mr-2 h-4 w-4" />
                                Registration Settings
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={create.url()}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-0">
                        {/* Status Tabs */}
                        <div className="-mx-6 flex gap-1 border-b px-6">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                                        currentStatus === tab.key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                    {counts[tab.countKey] > 0 && (
                                        <span
                                            className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                                                tab.key === 'pending'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {counts[tab.countKey]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {users.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Users className="mb-4 h-10 w-10 text-muted-foreground/40" />
                                <p className="font-medium text-muted-foreground">
                                    No users found
                                </p>
                                {currentStatus === 'pending' && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        No pending applications to review.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="w-10" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => {
                                            const statusCfg =
                                                STATUS_CONFIG[user.status];
                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {user.name}
                                                        </div>
                                                        {user.designation && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    user.designation
                                                                }
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                statusCfg.variant
                                                            }
                                                        >
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs text-muted-foreground">
                                                            {user.registration_type ===
                                                            'self_registered'
                                                                ? 'Self-registered'
                                                                : 'Admin created'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles
                                                                .slice(0, 2)
                                                                .map((r) => (
                                                                    <Badge
                                                                        key={
                                                                            r.id
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {r.name}
                                                                    </Badge>
                                                                ))}
                                                            {user.roles.length >
                                                                2 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    +
                                                                    {user.roles
                                                                        .length -
                                                                        2}
                                                                </Badge>
                                                            )}
                                                            {user.roles
                                                                .length ===
                                                                0 && (
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
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
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
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {users.from}–{users.to} of{' '}
                                            {users.total}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {users.links.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'ghost'
                                                    }
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() =>
                                                        link.url &&
                                                        router.visit(link.url)
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
                            </>
                        )}
                    </CardContent>
                </Card>
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

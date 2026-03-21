import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Pencil, Trash2, Shield, Lock } from 'lucide-react';
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
import TenantLayout from '@/layouts/TenantLayout';
import {
    destroy as TenantRoleDestroy,
    create as TenantRoleCreate,
    edit as TenantRoleEdit,
} from '@/routes/tenant/roles';

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    is_system: boolean;
    users_count: number;
}

export default function RolesIndex({ roles }: { roles: Role[] }) {
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(TenantRoleDestroy.url(deleteTarget.id), {
            onSuccess: () => toast(`"${deleteTarget.name}" deleted.`),
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <TenantLayout>
            <Head title="Roles" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Roles
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Define what each role can access based on your
                            subscription modules.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={TenantRoleCreate.url()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Role
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <Card key={role.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                role.is_system
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {role.is_system ? (
                                                <Lock className="h-4 w-4" />
                                            ) : (
                                                <Shield className="h-4 w-4" />
                                            )}
                                        </div>
                                        <CardTitle className="text-base">
                                            {role.name}
                                        </CardTitle>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        {role.is_system && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                System
                                            </Badge>
                                        )}
                                        {!role.is_active && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs text-muted-foreground"
                                            >
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {role.description && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {role.description}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        {role.users_count}
                                    </span>{' '}
                                    user{role.users_count !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto flex gap-2 pt-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="flex-1"
                                >
                                    <Link href={TenantRoleEdit.url(role.id)}>
                                        <Pencil className="mr-1 h-3.5 w-3.5" />{' '}
                                        Edit Permissions
                                    </Link>
                                </Button>
                                {!role.is_system && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setDeleteTarget(role)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
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
                            Users assigned only this role will lose all their
                            permissions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="text-destructive-foreground bg-destructive"
                            onClick={handleDelete}
                        >
                            Delete Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TenantLayout>
    );
}

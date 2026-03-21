import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TenantLayout from '@/layouts/TenantLayout';
import { index, store, update } from '@/routes/tenant/users';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    designation: string | null;
    department: string | null;
    roles: Role[];
}

interface Props {
    user?: User;
    roles: Role[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserForm({ user, roles }: Props) {
    const isEdit = !!user;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        phone: user?.phone ?? '',
        designation: user?.designation ?? '',
        department: user?.department ?? '',
        role_ids: user?.roles.map((r) => r.id) ?? ([] as number[]),
    });

    const toggleRole = (roleId: number) => {
        setData(
            'role_ids',
            data.role_ids.includes(roleId)
                ? data.role_ids.filter((id) => id !== roleId)
                : [...data.role_ids, roleId],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(update.url(user.id), { preserveScroll: true });
        } else {
            post(store.url());
        }
    };

    return (
        <TenantLayout>
            <Head title={isEdit ? 'Edit User' : 'Add User'} />

            <div className="max-w-2xl space-y-6">
                {/* Back link */}
                <div>
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? 'Edit User' : 'Add User'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isEdit
                            ? 'Update user details and role assignments.'
                            : 'Create a new user account. The account will be active immediately.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Basic identity information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label htmlFor="name">
                                        Full Name{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Jane Smith"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <Label htmlFor="email">
                                        Email{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="jane@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="designation">
                                        Designation
                                    </Label>
                                    <Input
                                        id="designation"
                                        value={data.designation}
                                        onChange={(e) =>
                                            setData(
                                                'designation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Senior Engineer"
                                    />
                                    {errors.designation && (
                                        <p className="text-xs text-destructive">
                                            {errors.designation}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="department">
                                        Department
                                    </Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) =>
                                            setData(
                                                'department',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Engineering"
                                    />
                                    {errors.department && (
                                        <p className="text-xs text-destructive">
                                            {errors.department}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="+1 555 000 0000"
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                {isEdit
                                    ? 'Leave blank to keep the current password.'
                                    : 'Set an initial password. Min. 8 characters with mixed case and numbers.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="password">
                                    Password{' '}
                                    {!isEdit && (
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    )}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder={
                                            isEdit
                                                ? 'Leave blank to keep current'
                                                : ''
                                        }
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                                        onClick={() =>
                                            setShowConfirm((v) => !v)
                                        }
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-xs text-destructive">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Assign one or more roles to control what this
                                user can access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {roles.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No roles available. Create roles first.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex items-start gap-3"
                                        >
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={data.role_ids.includes(
                                                    role.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleRole(role.id)
                                                }
                                                className="mt-0.5"
                                            />
                                            <label
                                                htmlFor={`role-${role.id}`}
                                                className="cursor-pointer space-y-1 text-sm leading-none"
                                            >
                                                <span className="font-medium">
                                                    {role.name}
                                                </span>
                                                {role.description && (
                                                    <p className="font-normal text-muted-foreground">
                                                        {role.description}
                                                    </p>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.role_ids && (
                                <p className="mt-2 text-xs text-destructive">
                                    {errors.role_ids}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving…'
                                : isEdit
                                  ? 'Update User'
                                  : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </TenantLayout>
    );
}

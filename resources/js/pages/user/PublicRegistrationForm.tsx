import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as publicRegisterStore } from '@/routes/tenant/users/public-register';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
    token: string;
    tenantName: string;
    requiresApproval: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PublicRegistrationForm({
    token,
    tenantName,
    requiresApproval,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        designation: '',
        department: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(publicRegisterStore.url({ token }));
    };

    return (
        <>
            <Head title={`Join ${tenantName}`} />

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md space-y-6">
                    {/* Tenant branding */}
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {tenantName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Fill in the form below to request access to this
                            workspace.
                        </p>
                        {requiresApproval && (
                            <p className="text-xs text-muted-foreground">
                                Your application will be reviewed before your
                                account is activated.
                            </p>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>
                                All fields marked * are required.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1.5">
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
                                        autoComplete="name"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
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
                                        autoComplete="email"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="password">
                                        Password{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            autoComplete="new-password"
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
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 8 characters with mixed case and
                                        numbers.
                                    </p>
                                    {errors.password && (
                                        <p className="text-xs text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={
                                                showConfirm
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            autoComplete="new-password"
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

                                <div className="space-y-4 border-t pt-4">
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Optional details
                                    </p>

                                    {/* Designation */}
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
                                            placeholder="Software Engineer"
                                        />
                                        {errors.designation && (
                                            <p className="text-xs text-destructive">
                                                {errors.designation}
                                            </p>
                                        )}
                                    </div>

                                    {/* Department */}
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

                                    {/* Phone */}
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

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Submitting…'
                                        : 'Submit Application'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

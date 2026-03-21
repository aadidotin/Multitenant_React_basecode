import { Head, useForm } from '@inertiajs/react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as tenantLoginStore } from '@/routes/tenant/login';
import { forgot as tenantPasswordForgot } from '@/routes/tenant/password';

interface Props {
    tenantName: string;
}

export default function TenantLogin({ tenantName }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // post(route('tenant.login.store'));
        post(tenantLoginStore.url());
    };

    useEffect(() => {
        const root = window.document.documentElement;

        const timer = setTimeout(() => {
            root.classList.remove('light', 'dark');

            root.classList.add('light');
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={`Sign in — ${tenantName}`} />

            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <span className="text-xl font-bold">
                                {tenantName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {tenantName}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Sign in to your workspace
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        placeholder="you@company.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        autoFocus
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        // href={route('tenant.password.forgot')}
                                        href={tenantPasswordForgot.url()}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-9"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(v) =>
                                        setData('remember', v === true)
                                    }
                                />
                                <label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-slate-600"
                                >
                                    Remember me
                                </label>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        These credentials do not match our
                                        records.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                        Signing in…
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

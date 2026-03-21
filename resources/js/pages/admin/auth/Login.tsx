import { Head, useForm } from '@inertiajs/react';
import { Mail, Lock, Loader2, AlertCircle, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login as centralLogin } from '@/routes/central';
import { forgot as centralPasswordForgot } from '@/routes/central/password';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CentralLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // post(route('central.login'));
        post(centralLogin.url());
    };

    return (
        <>
            <Head title="Platform Admin Login" />

            <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            Platform Admin
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Sign in to the admin portal
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-slate-200"
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="border-slate-600 bg-slate-700 pl-9 text-white placeholder:text-slate-400"
                                        placeholder="admin@example.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        autoFocus
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-slate-200"
                                    >
                                        Password
                                    </Label>
                                    <a
                                        // href={route('central.password.forgot')}
                                        href={centralPasswordForgot.url()}
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
                                        className="border-slate-600 bg-slate-700 pl-9 text-white placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-400">
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
                                    className="cursor-pointer text-sm text-slate-300"
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

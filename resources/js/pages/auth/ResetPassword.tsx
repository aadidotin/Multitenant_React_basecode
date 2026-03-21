import { Head, useForm } from '@inertiajs/react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update as centralPasswordUpdate } from '@/routes/central/password';
import { update as tenantPasswordUpdate } from '@/routes/tenant/password';

interface Props {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: Props) {
    const isTenant =
        window.location.hostname !==
        new URL(import.meta.env.VITE_APP_URL ?? '').hostname;

    const resetRoute = isTenant
        ? tenantPasswordUpdate.url()
        : centralPasswordUpdate.url();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token: token ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(resetRoute);
    };

    // Password strength indicator
    const strength = (() => {
        const p = data.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = [
        '',
        'bg-red-400',
        'bg-amber-400',
        'bg-blue-400',
        'bg-emerald-500',
    ];

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
            <Head title="Set New Password" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4">
                <div className="w-full max-w-md">
                    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Set new password
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Choose a strong password for{' '}
                                <span className="font-medium">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <input type="hidden" value={data.token} />

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        className="pr-10 pl-9"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {data.password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                                        i <= strength
                                                            ? strengthColor[
                                                                  strength
                                                              ]
                                                            : 'bg-slate-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Strength:{' '}
                                            <span className="font-medium">
                                                {strengthLabel[strength]}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        className="pr-10 pl-9"
                                        placeholder="••••••••"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirm((v) => !v)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                        Resetting…
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

// resources/js/Pages/Tenancy/VerificationInvalid.tsx
import { Head, Link, router } from '@inertiajs/react';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register as TenantRegister } from '@/routes/tenant';
import { resend as TenantVerificationResend } from '@/routes/tenant/verification';

export default function VerificationInvalid() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.post(
            TenantVerificationResend.url(),
            { email },
            {
                onSuccess: () => setSubmitted(true),
                onFinish: () => setLoading(false),
            },
        );
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
            <Head title="Invalid Verification Link" />

            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-red-50 via-white to-slate-100 p-4">
                <div className="w-full max-w-md space-y-6">
                    {/* Icon + heading */}
                    <div className="space-y-3 text-center">
                        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
                            <XCircle className="h-10 w-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Invalid or expired link
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-500">
                            This verification link is either invalid or has
                            already been used. Verification links expire after{' '}
                            <strong>48 hours</strong>.
                        </p>
                    </div>

                    {/* Resend form */}
                    {!submitted ? (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Request a new link
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Enter the email address you registered with.
                                </p>
                            </div>

                            <form onSubmit={handleResend} className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={!email || loading}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />{' '}
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCcw className="mr-2 h-4 w-4" />{' '}
                                            Resend Verification Email
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                            <p className="font-semibold text-emerald-800">
                                Email sent!
                            </p>
                            <p className="text-sm text-emerald-700">
                                Check your inbox for a new verification link.
                            </p>
                        </div>
                    )}

                    {/* Back link */}
                    <div className="text-center">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={TenantRegister.url()}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Back to registration
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

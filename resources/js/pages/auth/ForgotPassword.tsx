import { Head, useForm } from '@inertiajs/react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login as centralLogin } from '@/routes/central';
import { sendOtp as centralPasswordSendOtp } from '@/routes/central/password';
import { login as tenantLogin } from '@/routes/tenant';
import { sendOtp as tenantPasswordSendOtp } from '@/routes/tenant/password';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        email: '',
    });

    // Determine routes based on context (tenant subdomain vs central)
    const isTenant =
        window.location.hostname !==
        new URL(import.meta.env.VITE_APP_URL ?? '').hostname;
    const sendRoute = isTenant
        ? tenantPasswordSendOtp.url()
        : centralPasswordSendOtp.url();
    const loginRoute = isTenant ? tenantLogin.url() : centralLogin.url();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(sendRoute);
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
            <Head title="Reset Password" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4">
                <div className="w-full max-w-md">
                    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Forgot password?
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Enter your email and we'll send you a 6-digit
                                reset code.
                            </p>
                        </div>

                        {wasSuccessful && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                If this email exists, a reset code has been
                                sent. Check your inbox.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email address</Label>
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
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
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
                                        Sending code…
                                    </>
                                ) : (
                                    'Send Reset Code'
                                )}
                            </Button>
                        </form>

                        <a
                            href={loginRoute}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign
                            in
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

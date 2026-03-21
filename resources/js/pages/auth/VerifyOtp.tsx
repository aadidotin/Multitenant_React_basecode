import { Head, useForm } from '@inertiajs/react';
import { Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    verifyOtp as centralPasswordVerifyOtp,
    forgot as centralPasswordForgot,
} from '@/routes/central/password';
import {
    forgot as tenantPasswordForgot,
    verifyOtp as tenantPasswordVerifyOtp,
} from '@/routes/tenant/password';

interface Props {
    email: string;
}

export default function VerifyOtp({ email }: Props) {
    const isTenant =
        window.location.hostname !==
        new URL(import.meta.env.VITE_APP_URL ?? '').hostname;
    const verifyRoute = isTenant
        ? tenantPasswordVerifyOtp.url()
        : centralPasswordVerifyOtp.url();
    const backRoute = isTenant
        ? tenantPasswordForgot.url()
        : centralPasswordForgot.url();

    const { data, setData, post, processing, errors } = useForm({
        email: email ?? '',
        otp: ['', '', '', '', '', ''],
    });

    // Refs for auto-focus between boxes
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...data.otp];
        newOtp[index] = value;
        setData('otp', newOtp);

        // Auto-advance
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !data.otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);
        if (pasted.length === 6) {
            setData('otp', pasted.split(''));
            inputs.current[5]?.focus();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('otp', data.otp.join(''));
        post(verifyRoute);
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
            <Head title="Enter Reset Code" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4">
                <div className="w-full max-w-md">
                    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
                        <div className="text-center">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <KeyRound className="h-6 w-6" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Check your email
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                We sent a 6-digit code to{' '}
                                <span className="font-medium text-slate-700">
                                    {email}
                                </span>
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Expires in 15 minutes
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* OTP boxes */}
                            <div
                                className="flex justify-center gap-3"
                                onPaste={handlePaste}
                            >
                                {data.otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => {
                                            inputs.current[i] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleChange(i, e.target.value)
                                        }
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="h-12 w-10 rounded-lg border border-input bg-background text-center text-xl font-bold text-slate-800 shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            {errors.otp && (
                                <p className="text-center text-xs text-destructive">
                                    {errors.otp}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    processing || data.otp.some((d) => !d)
                                }
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                        Verifying…
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-slate-500">
                                Didn't receive the code?{' '}
                                <a
                                    href={backRoute}
                                    className="font-medium text-primary hover:underline"
                                >
                                    Try again
                                </a>
                            </p>
                        </div>

                        <a
                            href={backRoute}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

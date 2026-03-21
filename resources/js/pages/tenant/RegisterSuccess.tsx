import { Head } from '@inertiajs/react';
import { Mail, Clock, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    email?: string;
}

export default function RegisterSuccess({ email }: Props) {
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
            <Head title="Check your email" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Check your email
                        </h1>
                        <p className="mt-2 text-slate-500">
                            We've sent a verification link to{' '}
                            <span className="font-semibold text-slate-800">
                                {email ?? 'your email'}
                            </span>
                            .
                        </p>
                    </div>
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-left text-sm text-slate-600">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>
                                Click the link in the email to verify your
                                address
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <span>
                                After verification, our team will review and
                                approve your workspace (usually within 24 hours)
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>
                                You'll receive an email once your workspace is
                                ready to use
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">
                        Didn't receive it?{' '}
                        <a
                            href={`/verify-email/resend?email=${email}`}
                            className="font-medium text-primary hover:underline"
                        >
                            Resend verification email
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}

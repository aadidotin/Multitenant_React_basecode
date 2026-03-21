import { Head } from '@inertiajs/react';
import { CheckCircle, Clock } from 'lucide-react';
import { useEffect } from 'react';

export default function VerificationSuccess({
    tenant_name,
}: {
    tenant_name?: string;
}) {
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
            <Head title="Email Verified" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-slate-100 p-4">
                <div className="w-full max-w-md space-y-5 text-center">
                    <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Email verified!
                    </h1>
                    <p className="text-slate-500">
                        {tenant_name ? `${tenant_name}'s` : 'Your'} email has
                        been verified successfully. Our team has been notified
                        and will review your workspace shortly.
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        <Clock className="h-4 w-4 shrink-0" />
                        Approval typically takes up to 24 hours. We'll email you
                        when it's ready.
                    </div>
                </div>
            </div>
        </>
    );
}

import { usePage, Link } from '@inertiajs/react';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { useState } from 'react';

export default function TrialBanner() {
    const { trial } = usePage().props as any;
    const [dismissed, setDismissed] = useState(false);

    if (!trial?.show_warning || dismissed) return null;

    const urgent = trial.days_left <= 1;

    return (
        <div className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium
            ${urgent
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
        >
            <div className="flex items-center gap-2">
                {urgent
                    ? <AlertTriangle className="h-4 w-4 shrink-0" />
                    : <Clock className="h-4 w-4 shrink-0" />
                }
                <span>
                    {trial.days_left === 0
                        ? 'Your trial expires today!'
                        : `Your trial expires in ${trial.days_left} day${trial.days_left === 1 ? '' : 's'}.`
                    }
                    {' '}
                    <Link
                        // href={route('billing.index')}
                        className="underline underline-offset-2 hover:no-underline font-semibold"
                    >
                        Upgrade now to keep access →
                    </Link>
                </span>
            </div>
            <button onClick={() => setDismissed(true)} className="ml-4 opacity-80 hover:opacity-100">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
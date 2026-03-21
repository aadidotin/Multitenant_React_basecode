import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    Globe,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store as TenantRegisterStore } from '@/routes/tenant/register';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Company', icon: Building2 },
    { id: 2, label: 'Workspace', icon: Globe },
    { id: 3, label: 'Contact', icon: Mail },
];

const CENTRAL_DOMAIN = import.meta.env.VITE_APP_DOMAIN ?? 'localhost';

// ── Subdomain availability check (debounced) ───────────────────────────────

function useSubdomainCheck(subdomain: string) {
    const [status, setStatus] = useState<
        'idle' | 'checking' | 'available' | 'taken' | 'invalid'
    >('idle');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!subdomain) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('idle');
            return;
        }
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
            setStatus('invalid');
            return;
        }

        setStatus('checking');
        clearTimeout(timer.current);

        timer.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`,
                );
                const { available } = await res.json();
                setStatus(available ? 'available' : 'taken');
            } catch {
                setStatus('idle');
            }
        }, 500);

        return () => clearTimeout(timer.current);
    }, [subdomain]);

    return status;
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
    return (
        <div className="mb-10 flex items-center justify-center gap-0">
            {STEPS.map((step, i) => {
                const done = step.id < current;
                const active = step.id === current;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${done ? 'border-primary bg-primary text-primary-foreground' : ''} ${active ? 'border-primary bg-primary/10 text-primary' : ''} ${!done && !active ? 'border-muted-foreground/30 text-muted-foreground/40' : ''} `}
                            >
                                {done ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`mx-1 mb-5 h-px w-16 transition-colors duration-300 ${done ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TenantRegister() {
    const [step, setStep] = useState(1);

    useEffect(() => {
        const root = window.document.documentElement;

        const timer = setTimeout(() => {
            root.classList.remove('light', 'dark');

            root.classList.add('light');
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        subdomain: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        terms: false,
    });

    const subdomainStatus = useSubdomainCheck(data.subdomain);

    const autoSubdomain = (name: string) =>
        name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/^-+|-+$/g, '');

    const canProceedStep1 = data.company_name.trim().length >= 2;
    const canProceedStep2 =
        data.subdomain.length >= 3 && subdomainStatus === 'available';
    const canSubmit = data.email.trim() && data.country.trim() && data.terms;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(TenantRegisterStore.url());
    };

    return (
        <>
            <Head title="Create your workspace" />

            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4">
                {/* Background decoration */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative w-full max-w-lg">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Create your workspace
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Start your free 14-day trial. No credit card
                            required.
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
                        <StepIndicator current={step} />

                        <form onSubmit={submit}>
                            {/* ── Step 1: Company ─────────────────────── */}
                            {step === 1 && (
                                <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Tell us about your company
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            This will be the name of your
                                            workspace.
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="company_name">
                                            Company / Organisation Name *
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                            <Input
                                                id="company_name"
                                                className="pl-9"
                                                placeholder="Acme Corporation"
                                                value={data.company_name}
                                                onChange={(e) => {
                                                    setData(
                                                        'company_name',
                                                        e.target.value,
                                                    );
                                                    if (
                                                        !data.subdomain ||
                                                        data.subdomain ===
                                                            autoSubdomain(
                                                                data.company_name,
                                                            )
                                                    ) {
                                                        setData(
                                                            'subdomain',
                                                            autoSubdomain(
                                                                e.target.value,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        {errors.company_name && (
                                            <p className="text-xs text-destructive">
                                                {errors.company_name}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full"
                                        disabled={!canProceedStep1}
                                        onClick={() => setStep(2)}
                                    >
                                        Continue{' '}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* ── Step 2: Workspace / Subdomain ───────── */}
                            {step === 2 && (
                                <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Choose your workspace URL
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            This is the address your team will
                                            use to access the app.
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="subdomain">
                                            Subdomain *
                                        </Label>
                                        <div className="flex overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                            <div className="relative flex-1">
                                                <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="subdomain"
                                                    className="w-full bg-transparent py-2 pr-3 pl-9 text-sm outline-none"
                                                    placeholder="acme"
                                                    value={data.subdomain}
                                                    onChange={(e) =>
                                                        setData(
                                                            'subdomain',
                                                            e.target.value.toLowerCase(),
                                                        )
                                                    }
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex items-center border-l border-input bg-slate-50 px-3 text-sm whitespace-nowrap text-slate-500">
                                                .{CENTRAL_DOMAIN}
                                            </div>
                                        </div>

                                        {/* Availability indicator */}
                                        <div className="h-5">
                                            {subdomainStatus === 'checking' && (
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                                    Checking availability…
                                                </p>
                                            )}
                                            {subdomainStatus ===
                                                'available' && (
                                                <p className="flex items-center gap-1 text-xs text-emerald-600">
                                                    <Check className="h-3 w-3" />{' '}
                                                    {data.subdomain}.
                                                    {CENTRAL_DOMAIN} is
                                                    available!
                                                </p>
                                            )}
                                            {subdomainStatus === 'taken' && (
                                                <p className="flex items-center gap-1 text-xs text-destructive">
                                                    <AlertCircle className="h-3 w-3" />{' '}
                                                    This subdomain is already
                                                    taken.
                                                </p>
                                            )}
                                            {subdomainStatus === 'invalid' && (
                                                <p className="flex items-center gap-1 text-xs text-destructive">
                                                    <AlertCircle className="h-3 w-3" />{' '}
                                                    Only lowercase letters,
                                                    numbers, and hyphens
                                                    allowed.
                                                </p>
                                            )}
                                        </div>

                                        {errors.subdomain && (
                                            <p className="text-xs text-destructive">
                                                {errors.subdomain}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />{' '}
                                            Back
                                        </Button>
                                        <Button
                                            type="button"
                                            className="flex-1"
                                            disabled={!canProceedStep2}
                                            onClick={() => setStep(3)}
                                        >
                                            Continue{' '}
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Contact details ──────────────── */}
                            {step === 3 && (
                                <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Your contact details
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            We'll send your verification email
                                            here.
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email">
                                            Email Address *
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="pl-9"
                                                placeholder="you@company.com"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
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

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone">
                                            Phone Number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                className="pl-9"
                                                placeholder="+1 555 000 0000"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* City */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="city">City</Label>
                                            <div className="relative">
                                                <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                    id="city"
                                                    className="pl-9"
                                                    placeholder="New York"
                                                    value={data.city}
                                                    onChange={(e) =>
                                                        setData(
                                                            'city',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Country */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="country">
                                                Country *
                                            </Label>
                                            <Select
                                                value={data.country}
                                                onValueChange={(v) =>
                                                    setData('country', v)
                                                }
                                            >
                                                <SelectTrigger id="country">
                                                    <SelectValue placeholder="Select…" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {COUNTRIES.map((c) => (
                                                        <SelectItem
                                                            key={c.code}
                                                            value={c.name}
                                                        >
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.country && (
                                                <p className="text-xs text-destructive">
                                                    {errors.country}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary box */}
                                    <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                        <p className="font-medium text-slate-700">
                                            Workspace summary
                                        </p>
                                        <div className="space-y-0.5 text-slate-500">
                                            <p>
                                                Company:{' '}
                                                <span className="font-medium text-slate-800">
                                                    {data.company_name}
                                                </span>
                                            </p>
                                            <p>
                                                URL:{' '}
                                                <span className="font-medium text-slate-800">
                                                    {data.subdomain}.
                                                    {CENTRAL_DOMAIN}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Terms */}
                                    <div className="flex items-start gap-2.5">
                                        <Checkbox
                                            id="terms"
                                            checked={data.terms}
                                            onCheckedChange={(v) =>
                                                setData('terms', v === true)
                                            }
                                            className="mt-0.5"
                                        />
                                        <label
                                            htmlFor="terms"
                                            className="cursor-pointer text-sm leading-relaxed text-slate-600"
                                        >
                                            I agree to the{' '}
                                            <a
                                                href="/terms"
                                                className="text-primary underline underline-offset-2"
                                                target="_blank"
                                            >
                                                Terms of Service
                                            </a>{' '}
                                            and{' '}
                                            <a
                                                href="/privacy"
                                                className="text-primary underline underline-offset-2"
                                                target="_blank"
                                            >
                                                Privacy Policy
                                            </a>
                                        </label>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-xs text-destructive">
                                            {errors.terms}
                                        </p>
                                    )}

                                    {/* Server errors */}
                                    {Object.keys(errors).length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Please fix the errors above and
                                                try again.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(2)}
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />{' '}
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={!canSubmit || processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                                    Creating workspace…
                                                </>
                                            ) : (
                                                'Create Workspace'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have a workspace?{' '}
                        <a
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}

// ── Countries list ────────────────────────────────────────────────────────────
const COUNTRIES = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CA', name: 'Canada' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'EG', name: 'Egypt' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NO', name: 'Norway' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'KR', name: 'South Korea' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TR', name: 'Turkey' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'VN', name: 'Vietnam' },
];

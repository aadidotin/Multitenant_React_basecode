import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    Check,
    Copy,
    Link2,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import TenantLayout from '@/layouts/TenantLayout';
import {
    rotateToken as settingsRotateToken,
    update as settingsUpdate,
} from '@/routes/tenant/users/settings';
import { index } from '@/routes/tenant/users';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Settings {
    id: number;
    default_role_id: number | null;
    notify_on_submission: boolean;
    notify_on_review: boolean;
    registration_token: string;
    token_expires_at: string | null;
}

interface Props {
    settings: Settings;
    roles: Role[];
    registrationUrl: string;
    isExpired: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserRegistrationSettings({
    settings,
    roles,
    registrationUrl,
    isExpired,
}: Props) {
    const [copied, setCopied] = useState(false);
    const [showRotateConfirm, setShowRotateConfirm] = useState(false);

    const { data, setData, processing } = useForm<{
        default_role_id: string | null;
        notify_on_submission: boolean;
        notify_on_review: boolean;
        token_expires_in_days: string;
    }>({
        default_role_id: settings.default_role_id
            ? String(settings.default_role_id)
            : null,
        notify_on_submission: settings.notify_on_submission,
        notify_on_review: settings.notify_on_review,
        token_expires_in_days: settings.token_expires_at ? '' : 'never',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(
            settingsUpdate.url(),
            {
                default_role_id:
                    data.default_role_id === 'none' ||
                    data.default_role_id === null
                        ? null
                        : Number(data.default_role_id),
                notify_on_submission: data.notify_on_submission,
                notify_on_review: data.notify_on_review,
                token_expires_in_days:
                    data.token_expires_in_days === 'never'
                        ? null
                        : Number(data.token_expires_in_days),
            },
            {
                preserveScroll: true,
                onSuccess: () => toast('Settings saved.'),
            },
        );
    };

    const copyLink = () => {
        navigator.clipboard.writeText(registrationUrl);
        setCopied(true);
        toast('Registration link copied.');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRotate = () => {
        router.post(
            settingsRotateToken.url(),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast('Registration link rotated. Share the new link.');
                    setShowRotateConfirm(false);
                },
            },
        );
    };

    return (
        <TenantLayout>
            <Head title="Registration Settings" />

            <div className="max-w-2xl space-y-6">
                <div>
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Registration Settings
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage the public registration link and onboarding
                        preferences.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Registration link */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-muted-foreground" />
                                Public Registration Link
                            </CardTitle>
                            <CardDescription>
                                Share this link with anyone you want to invite
                                to apply. All submissions go to the pending
                                queue for review — no one gets access until you
                                approve them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Expired warning */}
                            {isExpired && (
                                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    This link has expired. Rotate it to generate
                                    a new one.
                                </div>
                            )}

                            {/* Link display + copy */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Registration link
                                </Label>
                                <div className="flex items-center gap-2">
                                    <code
                                        className={`flex-1 truncate rounded-md border bg-muted px-3 py-2 font-mono text-xs ${
                                            isExpired
                                                ? 'line-through opacity-40'
                                                : ''
                                        }`}
                                    >
                                        {registrationUrl}
                                    </code>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={copyLink}
                                        disabled={isExpired}
                                        className="shrink-0"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                {settings.token_expires_at && !isExpired && (
                                    <p className="text-xs text-muted-foreground">
                                        Expires{' '}
                                        {new Date(
                                            settings.token_expires_at,
                                        ).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                )}
                                {!settings.token_expires_at && (
                                    <p className="text-xs text-muted-foreground">
                                        This link never expires.
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Link duration */}
                            <div className="space-y-1.5">
                                <Label htmlFor="expiry">Link duration</Label>
                                <Select
                                    value={data.token_expires_in_days}
                                    onValueChange={(v) =>
                                        setData('token_expires_in_days', v)
                                    }
                                >
                                    <SelectTrigger id="expiry">
                                        <SelectValue placeholder="Never expires" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">
                                            Never expires
                                        </SelectItem>
                                        <SelectItem value="7">
                                            7 days
                                        </SelectItem>
                                        <SelectItem value="30">
                                            30 days
                                        </SelectItem>
                                        <SelectItem value="90">
                                            90 days
                                        </SelectItem>
                                        <SelectItem value="365">
                                            1 year
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Applies from the next time you rotate the
                                    link.
                                </p>
                            </div>

                            <Separator />

                            {/* Rotate */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Rotate link
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Generates a new URL and deactivates the
                                        current one.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRotateConfirm(true)}
                                >
                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    Rotate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Onboarding */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Onboarding</CardTitle>
                            <CardDescription>
                                Configure what happens once an application is
                                approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1.5">
                                <Label htmlFor="default-role">
                                    Default role on approval
                                </Label>
                                <Select
                                    value={data.default_role_id ?? 'none'}
                                    onValueChange={(v) =>
                                        setData(
                                            'default_role_id',
                                            v === 'none' ? null : v,
                                        )
                                    }
                                >
                                    <SelectTrigger id="default-role">
                                        <SelectValue placeholder="No default role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No default role
                                        </SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem
                                                key={r.id}
                                                value={String(r.id)}
                                            >
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Automatically assigned to the user when
                                    their application is approved.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Email notifications for registration events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Notify admins on new submission
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Admins receive an email when a new
                                        application is submitted.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.notify_on_submission}
                                    onCheckedChange={(v) =>
                                        setData('notify_on_submission', v)
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Notify applicant on review
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Applicants receive an email when
                                        approved or rejected.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.notify_on_review}
                                    onCheckedChange={(v) =>
                                        setData('notify_on_review', v)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Rotate confirmation */}
            <AlertDialog
                open={showRotateConfirm}
                onOpenChange={setShowRotateConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Rotate registration link?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The current link will stop working immediately.
                            Anyone who had the old link will need the new one to
                            register. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRotate}
                            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                        >
                            Rotate link
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TenantLayout>
    );
}

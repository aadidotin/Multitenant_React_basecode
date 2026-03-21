import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Props {
    tenantName: string;
    userName: string;
}

export default function PublicRegistrationSuccess({
    tenantName,
    userName,
}: Props) {
    return (
        <>
            <Head title="Application Submitted" />

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <Card>
                        <CardHeader className="pb-2 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
                                    <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <CardTitle className="text-xl">
                                Application received
                            </CardTitle>
                            <CardDescription className="mt-1 text-base">
                                {userName
                                    ? `Thank you, ${userName}.`
                                    : 'Thank you!'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2 text-center">
                            <p className="text-sm text-muted-foreground">
                                Your application to join{' '}
                                <strong>{tenantName}</strong> has been submitted
                                and is pending review. You'll receive an email
                                once it's been approved or rejected.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Please check your inbox — including spam — for
                                updates.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

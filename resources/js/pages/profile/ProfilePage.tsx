import { Head, useForm } from '@inertiajs/react';
import { Camera, ImageIcon, User, Lock } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/AppLayout';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface User {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    joining_date?: string | Date;
    avatar?: string;
    name?: string;
    title?: string;
    cover_url?: string;
    [key: string]: any;
}

interface Auth {
    user?: User;
}

function PersonalDetailsTab({ user }: { user?: User }) {
    const { data, setData, processing, errors } = useForm({
        first_name: user?.first_name ?? 'Dave',
        last_name: user?.last_name ?? 'Adame',
        phone: user?.phone ?? '+(1) 987 6543',
        email: user?.email ?? 'daveadame@velzon.com',
        joining_date: user?.joining_date ? new Date(user.joining_date) : null,
    });

    const [date] = useState(data.joining_date);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // patch(route("profile.update"));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                        First Name
                    </Label>
                    <Input
                        id="first_name"
                        value={data.first_name}
                        onChange={(e) => setData('first_name', e.target.value)}
                        className="h-11"
                    />
                    {errors.first_name && (
                        <p className="text-xs text-red-500">
                            {errors.first_name}
                        </p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                        Last Name
                    </Label>
                    <Input
                        id="last_name"
                        value={data.last_name}
                        onChange={(e) => setData('last_name', e.target.value)}
                        className="h-11"
                    />
                    {errors.last_name && (
                        <p className="text-xs text-red-500">
                            {errors.last_name}
                        </p>
                    )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                    </Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="h-11"
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="h-11"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Joining Date */}
                <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium">Joining Date</Label>
                    <Input type="date" />
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className=""
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className=""
                >
                    {processing ? 'Saving…' : 'Update'}
                </Button>
            </div>
        </form>
    );
}

function ChangePasswordTab() {
    const { data, setData, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // put(route("password.update"));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="max-w-lg space-y-5">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Current Password
                    </Label>
                    <Input
                        type="password"
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        className="h-11"
                        placeholder="Enter current password"
                    />
                    {errors.current_password && (
                        <p className="text-xs text-red-500">
                            {errors.current_password}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        New Password
                    </Label>
                    <Input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="h-11"
                        placeholder="Enter new password"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Confirm Password
                    </Label>
                    <Input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        className="h-11"
                        placeholder="Confirm new password"
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className=""
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className=""
                >
                    {processing ? 'Saving…' : 'Change Password'}
                </Button>
            </div>
        </form>
    );
}

// ─── Cover Upload ─────────────────────────────────────────────────────────────
function CoverSection({ coverUrl }: { coverUrl?: string }) {
    return (
        <div className="relative h-48 w-full overflow-hidden rounded-md sm:h-36 md:h-44">
            {/* Cover image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: coverUrl
                        ? `url(${coverUrl})`
                        : 'linear-gradient(90deg, rgb(255 255 255) 0%, rgb(255 255 255) 100%)',
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#405189]/40" />

            {/* Change Cover button */}
            <div className="absolute top-4 right-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <ImageIcon className="h-4 w-4" />
                    Change Cover
                </Button>
            </div>
        </div>
    );
}

// ─── Sidebar Card ─────────────────────────────────────────────────────────────

function ProfileSidebar({ user }: { user?: User }) {
    return (
        <div className="space-y-4">
            {/* Avatar + Name card */}
            <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="flex flex-col items-center px-6 py-4 text-center">
                    <div className="relative mb-4">
                        <div className="h-28 w-28 rounded-full bg-amber-400 p-1 shadow-md ring-4 ring-white">
                            <Avatar className="h-full w-full">
                                <AvatarImage
                                    src={user?.avatar}
                                    alt={user?.name ?? 'Anna Adame'}
                                />
                                <AvatarFallback className="bg-amber-100 text-xl font-semibold text-amber-700">
                                    AA
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {/* Camera overlay */}
                        <button
                            type="button"
                            className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#405189] text-white shadow-sm transition hover:bg-[#364372]"
                        >
                            <label>
                                <Camera className="h-3.5 w-3.5" />
                                <input type="file" hidden />
                            </label>
                        </button>
                    </div>
                    <h2 className="text-base font-semibold">
                        {user?.name ?? 'Anna Adame'}
                    </h2>
                    <p className="mt-0.5 text-sm">
                        {user?.title ?? 'Lead Designer / Developer'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage({
    user,
    auth,
}: {
    user?: User;
    auth?: Auth;
}) {
    return (
        <>
            <Head title="Profile" />

            {/* Page wrapper */}
            <div className="min-h-screen">
                {/* Cover */}
                <CoverSection coverUrl={user?.cover_url} />

                {/* Content area */}
                <div className="mx-auto max-w-6xl px-1 pb-16 sm:px-0 lg:px-1">
                    <div className="relative -mt-12 grid grid-cols-1 gap-6 sm:grid-cols-[280px_1fr]">
                        {/* LEFT: Sidebar */}
                        <ProfileSidebar user={user ?? auth?.user} />

                        {/* RIGHT: Tabs */}
                        <Card className="border-0 pb-0 shadow-sm">
                            <CardContent className="p-0">
                                <Tabs
                                    defaultValue="personal"
                                    className="w-full"
                                >
                                    {/* Tab list */}
                                    <TabsList
                                        variant="line"
                                        className="h-auto border-b-2 w-full flex-wrap gap-6 p-0 px-4 group-data-[orientation=horizontal]/tabs:h-auto"
                                    >
                                        {[
                                            {
                                                value: 'personal',
                                                label: 'Personal Details',
                                                icon: User,
                                            },
                                            {
                                                value: 'password',
                                                label: 'Change Password',
                                                icon: Lock,
                                            }
                                        ].map(
                                            ({ value, label, icon: Icon }) => (
                                                <TabsTrigger
                                                    key={value}
                                                    value={value}
                                                    className='group-data-[orientation=horizontal]/tabs:after:-bottom-0.5'
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4" />
                                                        {label}
                                                    </span>
                                                </TabsTrigger>
                                            ),
                                        )}
                                    </TabsList>

                                    {/* Tab panels */}
                                    <div className="p-6 sm:p-8">
                                        <TabsContent
                                            value="personal"
                                            className="mt-0"
                                        >
                                            <PersonalDetailsTab
                                                user={user ?? auth?.user}
                                            />
                                        </TabsContent>
                                        <TabsContent
                                            value="password"
                                            className="mt-0"
                                        >
                                            <ChangePasswordTab />
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ProfilePage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

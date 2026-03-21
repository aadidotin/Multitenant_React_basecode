import { Link } from '@inertiajs/react';

import {
    UserIcon,
    LogOutIcon,
} from 'lucide-react';

import type { ReactNode } from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { profilePage } from '@/routes/central';

type Props = {
    trigger: ReactNode;
    defaultOpen?: boolean;
    align?: 'start' | 'center' | 'end';
};

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

            {/* Smaller width */}
            <DropdownMenuContent className="w-64" align={align || 'end'}>
                {/* User Info */}
                <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2 font-normal">
                    <div className="relative">
                        {/* Smaller avatar */}
                        <Avatar className="size-8">
                            <AvatarImage
                                src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                                alt="John Doe"
                            />
                            <AvatarFallback className="text-xs">
                                JD
                            </AvatarFallback>
                        </Avatar>

                        {/* Smaller status dot */}
                        <span className="absolute right-0 bottom-0 block size-1.5 rounded-full bg-green-600 ring-2 ring-card" />
                    </div>

                    <div className="flex flex-1 flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-foreground">
                            John Doe
                        </span>
                        <span className="text-xs text-muted-foreground">
                            john.doe@example.com
                        </span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Account */}
                <DropdownMenuGroup>
                    <DropdownMenuItem className="gap-2 px-3 py-2 text-sm">
                        <Link
                            href={profilePage.get()}
                            className="flex items-center gap-2"
                        >
                            <UserIcon className="size-4" />
                            <span>My account</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                    variant="destructive"
                    className="gap-2 px-3 py-2 text-sm"
                >
                    <Link href={'#'} className="flex items-center gap-2">
                        <LogOutIcon className="size-4" />
                        <span>Logout</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProfileDropdown;

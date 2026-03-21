import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import ProfileDropdown from './ProfileDropdown';
import { ThemeSwitcher } from './ThemeSwitcher';

function Header() {
    return (
        <>
            <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="[&_svg]:!size-5" />
                <Separator
                    orientation="vertical"
                    className="hidden !h-4 sm:block"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                                Build Your Application
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="absolute inset-e-4 flex items-center gap-4">
                    <ThemeSwitcher />

                    <ProfileDropdown
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9.5"
                            >
                                <Avatar className="size-9.5 rounded-md">
                                    <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                            </Button>
                        }
                    />
                </div>
            </header>
        </>
    );
}

export default Header;

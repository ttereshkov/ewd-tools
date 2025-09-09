import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import aspects from '@/routes/aspects';
import borrowers from '@/routes/borrowers';
import divisions from '@/routes/divisions';
import periods from '@/routes/periods';
import templates from '@/routes/templates';
import users from '@/routes/users';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, BuildingIcon, ClipboardListIcon, ClockIcon, FileTextIcon, Folder, FolderIcon, LayoutGrid, UserIcon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'User',
        href: users.index(),
        icon: UserIcon,
    },
    {
        title: 'Divisi',
        href: divisions.index(),
        icon: BuildingIcon,
    },
    {
        title: 'Debitur',
        href: borrowers.index(),
        icon: FolderIcon,
    },
    {
        title: 'Template',
        href: templates.index(),
        icon: FileTextIcon,
    },
    {
        title: 'Aspek',
        href: aspects.index(),
        icon: ClipboardListIcon,
    },
    {
        title: 'Periode',
        href: periods.index(),
        icon: ClockIcon,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

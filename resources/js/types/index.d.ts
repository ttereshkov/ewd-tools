import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Borrower {
    id: number;
    name: string;
    division_id: number;
    division: Division;
    detail: BorrowerDetail;
    created_at: string;
    updated_at: string;
}

export interface BorrowerFacility {}

export interface BorrowerDetail {}

export interface Report {
    id: number;
    borrower: Borrower;
    period: Period;
    template: Template;
    status: string;
    submitted_at: string;
    rejection_reason: string;
    created_by: User;
}

export interface ReportAspect {}

export interface ReportSummary {}

export interface MonitoringNote {
    id: number;
    watchlist_id: number;
    report_id: number;
    watchlist_reason: string;
    account_strategy: string;
}

export interface ActionItem {
    id: number;
    action_description: string;
    progress_notes: string;
    people_in_charge: string;
    notes: string;
    due_date: string;
    status: ActionItemStatus;
    item_type: ActionItemType;
}

export type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type ActionItemType = 'previous_period' | 'current_progress' | 'next_period';

export interface WatchlistNotePageProps {
    report_data: Report;
    monitoring_note: MonitoringNote;
    action_items: {
        previous_period: ActionItem[];
        next_period: ActionItem[];
    };
}

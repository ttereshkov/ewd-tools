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
    division_id?: number;
    role_id: number;
    [key: string]: unknown;
}

export interface Division {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Borrower {
    id: number;
    name: string;
    division_id: number;
    division: Division;
    detail: BorrowerDetail;
    facilities: BorrowerFacility[];
    created_at: string;
    updated_at: string;
}

export interface BorrowerFacility {
    id: number;
    borrower_id: number;
    facility_name: string;
    limit: number;
    outstanding: number;
    interest_rate: number;
    principal_arrears: number;
    interest_arrears: number;
    pdo_days: number;
    maturity_date: string;
}

export interface BorrowerDetail {
    id: number;
    borrower_id: number;
    borrower_group: string;
    borrower_business: string;
    business_field: string;
    collectibility: number;
    economic_sector: string;
    purpose: number;
    restructuring: boolean;
    created_at: string;
    updated_at: string;
}

export interface Period {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export interface Template {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    latestTemplateVersion?: TemplateVersion;
}

export interface TemplateVersion {
    id: number;
    template_id: number;
    version_number: number;
    aspectVersions?: AspectVersion[];
    created_at: string;
    updated_at: string;
}

export interface AspectVersion {
    id: number;
    aspect: {
        id: number;
        code: string;
    };
    name: string;
    version_number: number;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: number;
    borrower: Borrower;
    period: Period;
    template: Template;
    creator: User;
    status: string;
    submitted_at: string;
    rejection_reason: string;
    created_by: number;
    summary: ReportSummary;
    aspects: ReportAspect[];
    watchlist?: Watchlist;
    created_at: string;
    updated_at: string;
}

export interface ReportAspect {
    id: number;
    report_id: number;
    aspect_version_id: number;
    aspect_version: AspectVersion;
    total_score: number;
    classification: string;
    created_at: string;
    updated_at: string;
}

export interface ReportSummary {
    id: number;
    report_id: number;
    business_notes?: string;
    final_classification: string;
    indicative_collectibility: number;
    is_override: boolean;
    override_reason?: string;
    override_by?: string;
    reviewer_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Watchlist {
    id: number;
    report_id: number;
    status: string;
    created_at: string;
    updated_at: string;
}

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
    watchlist: any;
    report_data: Report;
    monitoring_note: MonitoringNote;
    action_items: {
        previous_period: ActionItem[];
        current_progress: ActionItem[];
        next_period: ActionItem[];
    };
}

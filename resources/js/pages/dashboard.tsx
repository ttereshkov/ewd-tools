import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import approvals from '@/routes/approvals';
import borrowers from '@/routes/borrowers';
import periods from '@/routes/periods';
import forms from '@/routes/forms';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { BarChart3, CheckIcon, FileText, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const page = usePage<SharedData & { dashboardData?: any }>();
    const data = page.props.dashboardData ?? {};
    const title = data.title ?? 'Dashboard';
    const description = data.description ?? 'Pantau metrik dan aktivitas secara real-time';
    const stats: Record<string, number | string> = data.stats ?? {};
    const actionable: Record<string, number> = data.actionable_items ?? {};
    const quickActions: Record<string, boolean> = data.quick_actions ?? {};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                    {/* Header Section */}
                    <div className="mb-8 space-y-4 text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg shadow-blue-500/25">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-300 dark:to-blue-400">
                            {title}
                        </h1>
                        <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                            {description}
                        </p>
                    </div>

                    {/* Stats Cards: rendered dari backend sesuai role */}
                    <div className="mb-6 grid auto-rows-min gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {Object.entries(stats).map(([label, value], idx) => (
                            <div
                                key={label}
                                className="relative aspect-video overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5"
                            >
                                <div className="flex h-full items-center justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                                                {idx % 3 === 0 && <Users className="h-5 w-5 text-white" />}
                                                {idx % 3 === 1 && <TrendingUp className="h-5 w-5 text-white" />}
                                                {idx % 3 === 2 && <FileText className="h-5 w-5 text-white" />}
                                            </div>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                                                {label.replaceAll('_', ' ')}
                                            </h3>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{String(value)}</p>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-500/10 dark:stroke-emerald-400/10" />
                            </div>
                        ))}
                    </div>

                    {/* Actionable Items & Quick Actions */}
                    {(Object.keys(actionable).length > 0 || Object.keys(quickActions).length > 0) && (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Actionable Items */}
                            {Object.keys(actionable).length > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Prioritas</h2>
                                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                                        {Object.entries(actionable).map(([k, v]) => (
                                            <li key={k} className="flex items-center justify-between">
                                                <span>{k.replaceAll('_', ' ')}</span>
                                                <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                    {v}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Quick Actions */}
                            {Object.keys(quickActions).length > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Aksi Cepat</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {quickActions.create_report && (
                                            <Link href={forms.index().url} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
                                                <FileText className="h-4 w-4" /> Buat Laporan
                                            </Link>
                                        )}
                                        {quickActions.view_borrowers && (
                                            <Link href={borrowers.index().url} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-white hover:bg-slate-900">
                                                <Users className="h-4 w-4" /> Lihat Debitur
                                            </Link>
                                        )}
                                        {quickActions.check_periods && (
                                            <Link href={periods.index().url} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">
                                                <TrendingUp className="h-4 w-4" /> Periode Aktif
                                            </Link>
                                        )}
                                        {quickActions.review_reports && (
                                            <Link href={approvals.index().url} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">
                                                <FileText className="h-4 w-4" /> Review Laporan
                                            </Link>
                                        )}
                                        {quickActions.approve_reports && (
                                            <Link href={approvals.index().url} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">
                                                <CheckIcon className="h-4 w-4" /> Approve Laporan
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Content Placeholder */}
                    <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-8 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                        <div className="space-y-4 text-center">
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Analitik Utama</h2>
                            <p className="text-slate-600 dark:text-slate-400">Grafik dan tabel spesifik akan ditampilkan sesuai role.</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-slate-500/10 dark:stroke-slate-400/10" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

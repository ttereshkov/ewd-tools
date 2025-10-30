import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
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
                            Dashboard Overview
                        </h1>
                        <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                            Monitor your system performance and key metrics in real-time
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid auto-rows-min gap-6 md:grid-cols-3">
                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                            <div className="flex h-full items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                                            <Users className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Users</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">1,234</p>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">+12% from last month</p>
                                </div>
                            </div>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-500/10 dark:stroke-emerald-400/10" />
                        </div>

                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                            <div className="flex h-full items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-2">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Growth</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">+24%</p>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">Trending upward</p>
                                </div>
                            </div>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-orange-500/10 dark:stroke-orange-400/10" />
                        </div>

                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                            <div className="flex h-full items-center justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Reports</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">567</p>
                                    <p className="text-sm text-purple-600 dark:text-purple-400">Generated this month</p>
                                </div>
                            </div>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-purple-500/10 dark:stroke-purple-400/10" />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-8 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
                        <div className="space-y-4 text-center">
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Main Analytics</h2>
                            <p className="text-slate-600 dark:text-slate-400">Your detailed analytics and reports will appear here</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-slate-500/10 dark:stroke-slate-400/10" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

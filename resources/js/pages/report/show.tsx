import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import { BreadcrumbItem, Report, Template, Watchlist } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangleIcon, ArrowLeftIcon, BuildingIcon, CalendarIcon, CheckIcon, FileTextIcon, UserIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type PageProps = {
    report: Report;
    template: Template;
    watchlist?: Watchlist;
};

const formatCurrency = (value: number | string | undefined | null) => {
    const num = Number(value);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return '-';
    }
};

const formatBoolean = (value: boolean | undefined) => {
    if (value === undefined || value === null) return '-';
    return value ? 'Ya' : 'Tidak';
};

const getClassificationBg = (c?: string) => (c?.toUpperCase() === 'WATCHLIST' ? 'bg-red-100' : 'bg-green-100');
const getClassificationIcon = (c?: string) => (c?.toUpperCase() === 'WATCHLIST' ? AlertTriangleIcon : CheckIcon);

export default function ReportShow({ report }: PageProps) {
    const { borrower, creator, period, summary, aspects, facilities } = useMemo(() => {
        const borrower = report.borrower;
        const creator = report.creator;
        const summary = report.summary;
        const period = report.period;
        const aspects = report.aspects || [];
        const facilities = borrower.facilities || [];

        return { borrower, creator, period, summary, aspects, facilities };
    }, [report]);

    const facilitiesTotals = useMemo(() => {
        return facilities.reduce(
            (acc, facility) => {
                acc.total_limit += Number(facility.limit) || 0;
                acc.total_outstanding += Number(facility.outstanding) || 0;
                acc.total_principal_arrears += Number(facility.principal_arrears) || 0;
                acc.total_interest_arrears += Number(facility.interest_arrears) || 0;
                return acc;
            },
            { total_limit: 0, total_outstanding: 0, total_principal_arrears: 0, total_interest_arrears: 0 },
        );
    }, [facilities]);

    const [expandedSections, setExpandedSections] = useState({
        borrower: true,
        facilities: true,
        aspects: true,
        summary: true,
    });

    const toggleSection = useCallback((section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Laporan',
            href: reports.index().url,
        },
        {
            title: `${report.borrower.name}`,
            href: reports.show(report.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Laporan ${report.borrower.name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card className="mb-6">
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold md:text-2xl">Laporan {report.borrower.name}</CardTitle>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>
                                            {formatDate(period.start_date)} - {formatDate(period.end_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" />
                                        <span>{creator.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BuildingIcon className="h-4 w-4" />
                                        <span>{borrower.division.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {report.summary.final_classification === 'watchlist' && (
                                    <Button variant={'default'} size={'sm'} onClick={() => window.open(`/watchlist?reportId=${report.id}`, '_self')}>
                                        <FileTextIcon className="h-4 w-4" />
                                        Lihat NAW
                                    </Button>
                                )}
                                <Link href={reports.index().url}>
                                    <Button variant={'outline'} size={'sm'}>
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        Kembali
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
            <pre className="rounded bg-gray-100 p-4 text-sm">{JSON.stringify(report, null, 2)}</pre>
        </AppLayout>
    );
}

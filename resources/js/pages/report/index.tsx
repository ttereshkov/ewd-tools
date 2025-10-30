import DataPagination from '@/components/data-pagination';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reportRoutes from '@/routes/reports';
import { BreadcrumbItem, Report } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, Trash2Icon } from 'lucide-react';

type PageProps = {
    reports: {
        current_page: number;
        data: Report[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Laporan',
        href: reportRoutes.index().url,
    },
];

export default function ReportIndex() {
    const { reports } = usePage<PageProps>().props;
    const reportList = reports.data;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Laporan" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                            <h1 className="text-2xl font-bold md:text-3xl">Daftar Laporan</h1>
                            <p className="mt-2 text-blue-100">Kelola dan pantau semua laporan dalam sistem</p>
                        </div>

                        {/* Content Section */}
                        <Card className="shadow-lg">
                            <CardHeader className="rounded-t-lg bg-gray-50 dark:bg-gray-800">
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Laporan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reportList.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500">Belum ada user yang terdaftar. Silahkan tambahkan user baru.</div>
                                ) : (
                                    <Table className="w-full overflow-x-auto">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Debitur</TableHead>
                                                <TableHead>Divisi</TableHead>
                                                <TableHead>Periode</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportList.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell>{report.borrower.name}</TableCell>
                                                    <TableCell>{report.borrower.division.code}</TableCell>
                                                    <TableCell>{report.period.name}</TableCell>
                                                    <TableCell className="flex justify-end space-x-3 text-right">
                                                        <Link
                                                            href={'#'}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Edit User"
                                                        >
                                                            <EditIcon className="h-5 w-5" />
                                                        </Link>
                                                        <Link
                                                            href={reportRoutes.show(report.id).url}
                                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Show User"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {}}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Hapus User"
                                                        >
                                                            <Trash2Icon className="h-5 w-5" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                            <CardFooter className="rounded-b-lg bg-gray-50 dark:bg-gray-800">
                                <DataPagination paginationData={reports} />
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

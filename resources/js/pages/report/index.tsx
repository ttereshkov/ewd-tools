import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import { BreadcrumbItem, Report } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, Trash2Icon } from 'lucide-react';

type PageProps = {
    reports: Report[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Laporan',
        href: reports.index().url,
    },
];

export default function ReportIndex() {
    const { reports: reportList } = usePage<PageProps>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Laporan" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold md:text-2xl">List User</CardTitle>
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
                                                        href={reports.show(report.id).url}
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
                    </Card>
                </div>
            </div>
            <pre className="rounded bg-gray-100 p-4 text-sm">{JSON.stringify(reportList, null, 2)}</pre>
        </AppLayout>
    );
}

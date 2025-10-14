import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import periods from '@/routes/periods';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ClockIcon, EditIcon, EyeIcon, PlayIcon, PlusCircleIcon, StopCircle, Trash2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Period = {
    id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: number;
};

type PageProps = {
    periods: Period[];
    status_options: { value: number; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Periode', href: periods.index().url },
];

const getStatusBadgeClass = (status: number) => {
    switch (status) {
        case 0:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 1:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 2:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 3:
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function PeriodIndex() {
    const { periods: periodList, status_options } = usePage<PageProps>().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [periodToDelete, setPeriodToDelete] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isStatusUpdateLoading, setIsStatusUpdateLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const latestPeriod = useMemo(() => {
        if (!periodList.length) return null;
        const active = periodList.find((p) => p.status === 1);
        if (active) return active;
        return [...periodList].sort((a, b) => new Date(b.start_date ?? '').getTime() - new Date(a.start_date ?? '').getTime())[0];
    }, [periodList]);

    const remainingTime = useMemo(() => {
        if (!latestPeriod || !latestPeriod.end_date) return null;

        const end = new Date(latestPeriod.end_date);
        const now = currentTime;
        const diff = end.getTime() - now.getTime();

        if (Number(latestPeriod.status) === 0) return { status: 'draft', message: 'Periode masih dalam tahap draft' };
        if (Number(latestPeriod.status) === 2) return { status: 'ended', message: 'Waktu telah dihentikan admin' };
        if (diff < 0) return { status: 'expired', message: 'Periode telah selesai' };

        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);

        return { status: 'active', days: d, hours: h % 24, minutes: m % 60, seconds: s % 60 };
    }, [latestPeriod, currentTime]);

    const openDeleteModal = (id: number) => {
        setPeriodToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!periodToDelete) return;
        router.delete(periods.destroy(periodToDelete).url, {
            onSuccess: () => toast.success('Periode berhasil dihapus'),
            onError: (errs) => Object.values(errs).forEach((e) => toast.error(e as string)),
            onFinish: () => setIsDeleteModalOpen(false),
        });
    };

    const startPeriod = (id: number) => {
        setIsStatusUpdateLoading(true);
        router.post(
            periods.start(id).url,
            {},
            {
                onSuccess: () => toast.success('Periode berhasil dimulai'),
                onError: () => toast.error('Gagal memulai periode'),
                onFinish: () => setIsStatusUpdateLoading(false),
            },
        );
    };

    const endPeriod = (id: number) => {
        setIsStatusUpdateLoading(true);
        router.post(
            periods.stop(id).url,
            {},
            {
                onSuccess: () => toast.success('Periode berhasil diakhiri'),
                onError: () => toast.error('Gagal mengakhiri periode'),
                onFinish: () => setIsStatusUpdateLoading(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Periode" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    {latestPeriod && (
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center">
                                        <ClockIcon className="mr-6 h-10 w-10 text-blue-500" />
                                        <div>
                                            <h3 className="text-lg font-semibold">{latestPeriod.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(latestPeriod.start_date)} - {formatDate(latestPeriod.end_date)}
                                            </p>
                                            <Badge className={getStatusBadgeClass(Number(latestPeriod.status))}>
                                                {status_options.find((s) => s.value === Number(latestPeriod.status))?.label ?? '-'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {remainingTime && (
                                        <div className="flex flex-col space-y-4">
                                            {remainingTime.status === 'active' ? (
                                                <div className="flex justify-center space-x-4">
                                                    {['Hari', 'Jam', 'Menit', 'Detik'].map((unit, i) => {
                                                        const val = [
                                                            remainingTime.days,
                                                            remainingTime.hours,
                                                            remainingTime.minutes,
                                                            remainingTime.seconds,
                                                        ][i];
                                                        return (
                                                            <div className="text-center" key={unit}>
                                                                <div className="text-2xl font-bold">{val}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{unit}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-700 dark:text-gray-300">{remainingTime.message}</p>
                                            )}

                                            <div className="flex justify-end space-x-2">
                                                {Number(latestPeriod.status) === 0 && (
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => startPeriod(latestPeriod.id)}
                                                        disabled={isStatusUpdateLoading}
                                                    >
                                                        <PlayIcon className="mr-2 h-4 w-4" />
                                                        Mulai
                                                    </Button>
                                                )}
                                                {Number(latestPeriod.status) === 1 && (
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => endPeriod(latestPeriod.id)}
                                                        disabled={isStatusUpdateLoading}
                                                    >
                                                        <StopCircle className="mr-2 h-4 w-4" />
                                                        Akhiri
                                                    </Button>
                                                )}
                                                {[2, 3].includes(Number(latestPeriod.status)) && (
                                                    <Button variant="outline" disabled>
                                                        Periode Selesai
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-xl font-bold">Periode</CardTitle>
                            <Link href={periods.create().url}>
                                <Button>
                                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                                    Buat Periode Baru
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {periodList.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">Belum ada periode yang terdaftar.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Periode</TableHead>
                                            <TableHead>Tanggal Mulai</TableHead>
                                            <TableHead>Tanggal Selesai</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periodList.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell>{formatDate(p.start_date)}</TableCell>
                                                <TableCell>{formatDate(p.end_date)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadgeClass(Number(p.status))}>
                                                        {status_options.find((s) => s.value === Number(p.status))?.label ?? '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="flex justify-end space-x-3">
                                                    <Link href={periods.edit(p.id).url} title="Edit" className="text-blue-600 hover:text-blue-800">
                                                        <EditIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link href={periods.show(p.id).url} title="View" className="text-green-600 hover:text-green-800">
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(p.id)}
                                                        title="Delete"
                                                        className="text-red-600 hover:text-red-800"
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
        </AppLayout>
    );
}

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
        case 1:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 2:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 3:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 4:
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

        if (Number(latestPeriod.status) === 1) return { status: 'draft', message: 'Periode masih dalam tahap draft' };
        if (Number(latestPeriod.status) === 3) return { status: 'ended', message: 'Waktu telah dihentikan admin' };
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                            <ClockIcon className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                            Manajemen Periode
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Kelola periode pelaporan dan waktu aktif sistem
                        </p>
                    </div>

                    {latestPeriod && (
                        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center text-white">
                                        <div className="mr-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                            <ClockIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{latestPeriod.name}</h3>
                                            <p className="text-indigo-100">
                                                {formatDate(latestPeriod.start_date)} - {formatDate(latestPeriod.end_date)}
                                            </p>
                                            <Badge className={`mt-2 ${getStatusBadgeClass(Number(latestPeriod.status))} border-0`}>
                                                {status_options.find((s) => s.value === Number(latestPeriod.status))?.label ?? '-'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {remainingTime && (
                                        <div className="flex flex-col space-y-4">
                                            {remainingTime.status === 'active' ? (
                                                <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4">
                                                    <div className="flex justify-center space-x-6">
                                                        {['Hari', 'Jam', 'Menit', 'Detik'].map((unit, i) => {
                                                            const val = [
                                                                remainingTime.days,
                                                                remainingTime.hours,
                                                                remainingTime.minutes,
                                                                remainingTime.seconds,
                                                            ][i];
                                                            return (
                                                                <div className="text-center" key={unit}>
                                                                    <div className="text-3xl font-bold text-white">{val}</div>
                                                                    <div className="text-xs text-indigo-200">{unit}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4">
                                                    <p className="text-center text-white font-medium">{remainingTime.message}</p>
                                                </div>
                                            )}

                                            <div className="flex justify-end space-x-2">
                                                {Number(latestPeriod.status) === 1 && (
                                                    <Button
                                                        className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg"
                                                        onClick={() => startPeriod(latestPeriod.id)}
                                                        disabled={isStatusUpdateLoading}
                                                    >
                                                        <PlayIcon className="mr-2 h-4 w-4" />
                                                        Mulai
                                                    </Button>
                                                )}
                                                {Number(latestPeriod.status) === 2 && (
                                                    <Button
                                                        className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg"
                                                        onClick={() => endPeriod(latestPeriod.id)}
                                                        disabled={isStatusUpdateLoading}
                                                    >
                                                        <StopCircle className="mr-2 h-4 w-4" />
                                                        Akhiri
                                                    </Button>
                                                )}
                                                {[3, 4].includes(Number(latestPeriod.status)) && (
                                                    <Button className="bg-white/20 text-white border-0" disabled>
                                                        Periode Selesai
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-xl font-bold flex items-center gap-3">
                                    <ClockIcon className="h-6 w-6" />
                                    Daftar Periode
                                </CardTitle>
                                <Link href={periods.create().url}>
                                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-md">
                                        <PlusCircleIcon className="mr-2 h-4 w-4" />
                                        Buat Periode Baru
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {periodList.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                        <ClockIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Belum ada periode yang terdaftar.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border-b border-indigo-200 dark:border-indigo-700">
                                                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Periode</TableHead>
                                                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Tanggal Mulai</TableHead>
                                                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Tanggal Selesai</TableHead>
                                                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Status</TableHead>
                                                <TableHead className="text-right font-semibold text-indigo-900 dark:text-indigo-100">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {periodList.map((p, index) => (
                                                <TableRow 
                                                    key={p.id}
                                                    className={`hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${
                                                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-indigo-25 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <TableCell className="font-medium text-indigo-900 dark:text-indigo-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                                                <ClockIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            {p.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{formatDate(p.start_date)}</TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{formatDate(p.end_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={`${getStatusBadgeClass(Number(p.status))} border-0 shadow-sm`}>
                                                            {status_options.find((s) => s.value === Number(p.status))?.label ?? '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link 
                                                                href={periods.edit(p.id).url} 
                                                                title="Edit" 
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-800 transition-colors"
                                                            >
                                                                <EditIcon className="h-4 w-4" />
                                                            </Link>
                                                            <Link 
                                                                href={periods.show(p.id).url} 
                                                                title="View" 
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800 transition-colors"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => openDeleteModal(p.id)}
                                                                title="Delete"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 transition-colors"
                                                            >
                                                                <Trash2Icon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-t border-indigo-200 dark:border-indigo-700 p-6 rounded-b-lg">
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                    Total: {periodList.length} periode
                                </p>
                                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Manajemen Waktu</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

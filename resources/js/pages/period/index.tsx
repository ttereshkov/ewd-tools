import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    status: string;
};

type PageProps = {
    periods: Period[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Periode',
        href: periods.index().url,
    },
];

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'draft':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'active':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'ended':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'expired':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function PeriodIndex() {
    const { periods: periodList } = usePage<PageProps>().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [periodToDelete, setPeriodToDelete] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isStatusUpdateLoading, setIsStatusUpdateLoading] = useState(false);

    useEffect(() => {
        const timerInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerInterval);
        };
    }, []);

    const latestPeriod = useMemo(() => {
        if (!periodList || periodList.length === 0) return null;

        const activePeriod = periodList.find((period) => period.status === 'active');
        if (activePeriod) {
            return activePeriod;
        }

        return [...periodList].sort((a, b) => {
            const dateA = new Date(a.start_date as string);
            const dateB = new Date(b.start_date as string);
            return dateB.getTime() - dateA.getTime();
        })[0];
    }, [periodList]);

    const remainingTime = useMemo(() => {
        if (!latestPeriod || !latestPeriod.end_date) return null;

        const endDate = new Date(latestPeriod.end_date);
        const now = currentTime;

        const diffMs = endDate.getTime() - now.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (latestPeriod.status === 'draft') {
            return {
                status: 'draft',
                message: 'Periode masih dalam tahap draft',
            };
        }

        if (latestPeriod.status === 'ended') {
            return {
                status: 'ended',
                message: 'Waktu telah dihentikan admin',
            };
        }

        if (isNaN(endDate.getTime()) || isNaN(now.getTime())) {
            return {
                status: 'invalid',
                message: 'Tanggal periode tidak valid',
            };
        }

        if (diffMs < 0) {
            return {
                status: 'expired',
                message: `Periode telah selesai`,
            };
        }

        return {
            status: 'active',
            days: diffDays,
            hours: diffHours % 24,
            minutes: diffMinutes % 60,
            seconds: diffSeconds % 60,
        };
    }, [latestPeriod, currentTime]);

    const openDeleteModal = (id: number) => {
        setPeriodToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setPeriodToDelete(null);
    };

    const handleDelete = (id: number) => {
        if (periodToDelete) {
            router.delete(periods.destroy(periodToDelete!).url, {
                onSuccess: () => {
                    toast.success('Periode berhasil dihapus');
                },
                onError: (errs) => {
                    Object.values(errs).forEach((error) => {
                        toast.error(error as string);
                    });
                },
                onFinish: () => {
                    closeDeleteModal();
                },
            });
        }
    };

    const startPeriod = (id: number) => {
        setIsStatusUpdateLoading(true);
        router.post(
            periods.start(id).url,
            {},
            {
                onSuccess: () => {
                    toast.success('Periode berhasil dimulai');
                    setIsStatusUpdateLoading(false);
                },
                onError: () => {
                    toast.error('Gagal memulai periode. Silahkan coba lagi.');
                    setIsStatusUpdateLoading(false);
                },
            },
        );
    };

    const endPeriod = (id: number) => {
        setIsStatusUpdateLoading(true);
        router.post(
            periods.stop(id).url,
            {},
            {
                onSuccess: () => {
                    toast.success('Periode berhasil diakhiri');
                    setIsStatusUpdateLoading(false);
                },
                onError: () => {
                    toast.error('Gagal mengakhiri periode. Silakan coba lagi.');
                    setIsStatusUpdateLoading(false);
                },
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
                                            <div className="font-regular text-xl">
                                                Periode Aktif:
                                                <h3 className="text-lg font-semibold">{latestPeriod.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(latestPeriod.start_date)} - {formatDate(latestPeriod.end_date)}
                                            </p>
                                            <div className="mt-1">
                                                <Badge className={getStatusBadgeClass(latestPeriod.status)}>{latestPeriod.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    {remainingTime && (
                                        <div className="flex flex-col space-y-4">
                                            {remainingTime.status === 'active' ? (
                                                <div className="flex justify-center space-x-4 md:justify-end">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{remainingTime.days}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Hari</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{remainingTime.hours}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Jam</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{remainingTime.minutes}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Menit</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{remainingTime.seconds}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Detik</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                        {remainingTime.message}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-center space-x-2 md:justify-end">
                                                {latestPeriod.status === 'draft' && (
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => startPeriod(latestPeriod.id)}
                                                        disabled={isStatusUpdateLoading}
                                                    >
                                                        <PlayIcon className="mr-2 h-4 w-4" />
                                                        Mulai
                                                    </Button>
                                                )}
                                                {latestPeriod.status === 'active' && (
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => endPeriod(latestPeriod.id)}
                                                        disabled={isStatusUpdateLoading}
                                                    >
                                                        <StopCircle className="mr-2 h-4 w-4" />
                                                        Akhiri
                                                    </Button>
                                                )}
                                                {['ended', 'expired'].includes(latestPeriod.status) && (
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
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold md:text-2xl">Periode</CardTitle>
                            <Link href={periods.create().url}>
                                <Button>
                                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                                    Buat Periode Baru
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {periodList.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">Belum ada periode yang terdaftar. Silakan mulai periode baru.</div>
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
                                        {periodList.map((period) => (
                                            <TableRow key={period.id}>
                                                <TableCell>{period.name}</TableCell>
                                                <TableCell>{formatDate(period.start_date)}</TableCell>
                                                <TableCell>{formatDate(period.end_date)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadgeClass(period.status)}>{period.status}</Badge>
                                                </TableCell>
                                                <TableCell className="flex justify-end space-x-3 text-right">
                                                    <Link
                                                        href={periods.edit(period.id).url}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit"
                                                    >
                                                        <EditIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={periods.show(period.id).url}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        title="View"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(period.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Delete"
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
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <Card className="w-full max-w-sm animate-in fade-in zoom-in">
                        <CardHeader className="items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                <Trash2Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Apakah anda yakin ingin menghapus data ini?
                                <br />
                                Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse gap-3 px-6 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={closeDeleteModal}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={() => periodToDelete && handleDelete(periodToDelete)}>
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}

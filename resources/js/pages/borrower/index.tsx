import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import borrowerRoutes from '@/routes/borrowers';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Borrower = {
    id: number;
    name: string;
    division_id: number;
    division: Division;
    created_at: string;
    updated_at: string;
};

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

type PageProps = {
    borrowers: {
        current_page: number;
        data: Borrower[];
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
        title: 'Debitur',
        href: borrowerRoutes.index().url,
    },
];

export default function BorrowerIndex() {
    const { borrowers } = usePage<PageProps>().props;
    const borrowerList = borrowers.data;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [borrowerToDelete, setBorrowerToDelete] = useState<number | null>(null);

    const openDeleteModal = (id: number) => {
        setBorrowerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setBorrowerToDelete(null);
    };

    const handleDelete = (id: number) => {
        router.delete(borrowerRoutes.destroy(borrowerToDelete!).url, {
            onSuccess: () => {
                toast.success('Debitur berhasil dihapus');
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
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Debitur" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-3xl font-bold">Manajemen Debitur</h1>
                                    <p className="text-lg text-blue-100">Kelola data debitur dan informasi divisi terkait</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                                        <div className="text-2xl font-bold">{borrowerList.length}</div>
                                        <div className="text-sm text-blue-100">Total Debitur</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex justify-end">
                            <Link href={borrowerRoutes.create().url}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Tambah Debitur
                                </Button>
                            </Link>
                        </div>

                        {/* Data Table */}
                        <Card className="border-0 bg-white shadow-lg">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-slate-800">
                                    Daftar Debitur ({borrowerList.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {borrowerList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                            <PlusIcon className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-slate-600">Belum ada debitur</h3>
                                        <p className="text-slate-500">Belum ada debitur yang terdaftar. Silahkan tambahkan debitur baru.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama Debitur</TableHead>
                                                <TableHead>Divisi</TableHead>
                                                <TableHead>Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {borrowerList.map((borrower) => (
                                                <TableRow key={borrower.id}>
                                                    <TableCell className="font-medium">{borrower.name}</TableCell>
                                                    <TableCell>{borrower.division.code}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Link href={borrowerRoutes.show(borrower.id).url}>
                                                                <Button variant="outline" size="sm">
                                                                    <EyeIcon className="mr-1 h-4 w-4" />
                                                                    Lihat
                                                                </Button>
                                                            </Link>
                                                            <Link href={borrowerRoutes.edit(borrower.id).url}>
                                                                <Button variant="outline" size="sm">
                                                                    <EditIcon className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => openDeleteModal(borrower.id)}
                                                            >
                                                                <Trash2Icon className="mr-1 h-4 w-4" />
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                            <CardFooter>
                                <DataPagination paginationData={borrowers} />
                            </CardFooter>
                        </Card>
                    </div>
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
                            <Button variant="destructive" onClick={() => borrowerToDelete && handleDelete(borrowerToDelete)}>
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}

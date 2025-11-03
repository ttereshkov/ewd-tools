import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import divisionRoutes from '@/routes/divisions';
import { type BreadcrumbItem, type Division, type MaybePaginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BuildingIcon, EditIcon, EyeIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type PageProps = {
    divisions: MaybePaginated<Division>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Divisi',
        href: divisionRoutes.index().url,
    },
];

export default function DivisionIndex() {
    const pageProps = usePage<PageProps>().props as any;
    const divisions = pageProps.divisions as Paginated<Division> | Division[] | undefined;
    const divisionList: Division[] = Array.isArray(divisions) ? divisions : divisions?.data ?? [];
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);

    const openDeleteModal = (id: number) => {
        setDivisionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDivisionToDelete(null);
    };

    const handleDelete = (id: number) => {
        router.delete(divisionRoutes.destroy(id).url, {
            onSuccess: () => {
                toast.success('Divisi berhasil dihapus');
            },
            onError: (errs: any) => {
                Object.values(errs || {}).forEach((error) => {
                    toast.error(String(error));
                });
            },
            onFinish: () => {
                closeDeleteModal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Divisi" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl border bg-card p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manajemen Divisi</h1>
                                    <p className="text-sm text-muted-foreground sm:text-base">Kelola struktur organisasi dan divisi perusahaan</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">{divisionList.length}</div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Total Divisi</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle></CardTitle>
                                <Link href={divisionRoutes.create().url}>
                                    <Button>
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah Divisi
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-0">
                                {divisionList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <BuildingIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium">Belum ada divisi</h3>
                                        <p className="text-muted-foreground">Belum ada divisi yang terdaftar. Silahkan tambahkan divisi baru.</p>
                                    </div>
                                ) : (
                                    <Table className="min-w-[720px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {divisionList.map((division) => (
                                                <TableRow key={division.id}>
                                                    <TableCell className="font-medium">{division.code}</TableCell>
                                                    <TableCell>{division.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            <Link href={divisionRoutes.show(division.id).url}>
                                                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                    <EyeIcon className="mr-1 h-4 w-4" />
                                                                    Lihat
                                                                </Button>
                                                            </Link>
                                                            <Link href={divisionRoutes.edit(division.id).url}>
                                                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                    <EditIcon className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="whitespace-nowrap text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                                onClick={() => openDeleteModal(division.id)}
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
                            <CardFooter>{(divisions as any)?.links ? <DataPagination paginationData={divisions as any} /> : null}</CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <Card className="w-full max-w-sm animate-in fade-in zoom-in">
                        <CardHeader className="items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Trash2Icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Apakah anda yakin ingin menghapus data ini?
                                <br />
                                Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse gap-3 px-6 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={closeDeleteModal}>
                                Batal
                            </Button>
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => divisionToDelete && handleDelete(divisionToDelete)}
                            >
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}

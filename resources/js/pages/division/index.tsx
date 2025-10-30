import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import divisions from "@/routes/divisions";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { BuildingIcon, EditIcon, EyeIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

type PageProps = {
    divisions: Division[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: dashboard().url
    },
    {
        title: "Divisi",
        href: divisions.index().url
    }
];

export default function DivisionIndex() {
    const { divisions: divisionList } = usePage<PageProps>().props;
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
        router.delete(divisions.destroy(divisionToDelete!).url, {
            onSuccess: () => {
                toast.success("Divisi berhasil dihapus");
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
            <Head title="List Divisi" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-950 dark:via-sky-950 dark:to-cyan-950 py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-sky-500 shadow-lg">
                            <BuildingIcon className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                            Manajemen Divisi
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Kelola struktur organisasi dan divisi perusahaan
                        </p>
                    </div>
                    
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-t-lg">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-lg font-bold md:text-2xl flex items-center gap-3">
                                    <BuildingIcon className="h-6 w-6" />
                                    Daftar Divisi
                                </CardTitle>
                                <Link href={divisions.create().url}>
                                    <Button className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-md">
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah Divisi
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {divisionList.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                        <BuildingIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Belum ada divisi yang terdaftar. Silahkan tambahkan divisi baru.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/50 dark:to-sky-900/50 border-b border-blue-200 dark:border-blue-700">
                                                <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Kode</TableHead>
                                                <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Nama</TableHead>
                                                <TableHead className="text-right font-semibold text-blue-900 dark:text-blue-100">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {divisionList.map((division, index) => (
                                                <TableRow 
                                                    key={division.id}
                                                    className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                                                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-blue-25 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <TableCell className="font-medium text-blue-900 dark:text-blue-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                                    {division.code.charAt(0)}
                                                                </span>
                                                            </div>
                                                            {division.code}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{division.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={divisions.edit(division.id).url}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 transition-colors"
                                                                title="Edit Divisi"
                                                            >
                                                                <EditIcon className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={divisions.show(division.id).url}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800 transition-colors"
                                                                title="Lihat Divisi"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => openDeleteModal(division.id)}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 transition-colors"
                                                                title="Hapus Divisi"
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
                        <CardFooter className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-t border-blue-200 dark:border-blue-700 p-6 rounded-b-lg">
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Total: {divisionList.length} divisi
                                </p>
                                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                    <BuildingIcon className="h-4 w-4" />
                                    <span>Struktur Organisasi</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <Card className="w-full max-w-sm animate-in fade-in zoom-in">
                        <CardHeader className="items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                <Trash2Icon className="h-6 w-6 text-red-600 dark:text-red-400"/>
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
                            <Button
                                variant="destructive"
                                onClick={() => divisionToDelete && handleDelete(divisionToDelete)}
                            >
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    )
}
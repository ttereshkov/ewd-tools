import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import divisions from "@/routes/divisions";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { EditIcon, EyeIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold md:text-2xl">List Divisi</CardTitle>
                            <Link href={divisions.create().url}>
                                <Button>
                                    <PlusIcon className="h-4 w-4" />
                                    Tambah Divisi
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {divisionList.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    Belum ada divisi yang terdaftar. Silahkan tambahkan divisi baru.
                                </div>
                            ) : (
                                <Table className="w-full overflow-x-auto">
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
                                                <TableCell>{division.code}</TableCell>
                                                <TableCell>{division.name}</TableCell>
                                                <TableCell className="flex justify-end space-x-3 text-right">
                                                    <Link
                                                        href={divisions.edit(division.id).url}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit Divisi"
                                                    >
                                                        <EditIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={divisions.show(division.id).url}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Lihat Divisi"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(division.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Hapus Divisi"
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
                        <CardFooter className="flex flex-col-reverse gap-3 bg-gray-50 px-6 sm:flex-row sm:justify-end dark:bg-gray-900/50">
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
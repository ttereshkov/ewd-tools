import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import aspects from '@/routes/aspects';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Aspect = {
    id: number;
    code: string;
    latest_aspect_version: AspectVersion;
    created_at: string;
    updated_at: string;
};

type AspectVersion = {
    id: number;
    name: string;
    version_number: string;
    description?: string;
    question_versions: QuestionVersion[];
};

type QuestionVersion = {
    question_text: string;
    weight: number;
    is_mandatory: boolean;
    options: Option[];
    visibility_rules: VisibilityRule[];
};

type Option = {
    option_text: string;
    score: number;
};

type VisibilityRule = {
    description: string;
    source_type: string;
    source_field: string;
    operator: string;
    value: string;
};

type PageProps = {
    aspects: Aspect[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Aspek',
        href: aspects.index().url,
    },
];

export default function AspectIndex() {
    const { aspects: aspectList } = usePage<PageProps>().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [aspectToDelete, setAspectToDelete] = useState<number | null>(null);

    const openDeleteModal = (id: number) => {
        setAspectToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setAspectToDelete(null);
    };

    const handleDelete = (id: number) => {
        router.delete(aspects.destroy(aspectToDelete!).url, {
            onSuccess: () => {
                toast.success('Aspek berhasil dihapus');
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
            <Head title="List Aspek" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold md:text-2xl">List Aspek</CardTitle>
                            <Link href={aspects.create().url}>
                                <Button>
                                    <PlusIcon className="h-4 w-4" />
                                    Tambah Aspek
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {aspectList.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">Belum ada aspek yang terdaftar. Silahkan tambahkan aspek baru.</div>
                            ) : (
                                <Table className="w-full overflow-x-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Versi</TableHead>
                                            <TableHead>Jumlah Pertanyaan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {aspectList.map((aspect) => (
                                            <TableRow key={aspect.id}>
                                                <TableCell>{aspect.latest_aspect_version.name}</TableCell>
                                                <TableCell>{aspect.code}</TableCell>
                                                <TableCell>v{aspect.latest_aspect_version.version_number}</TableCell>
                                                <TableCell>{aspect.latest_aspect_version.question_versions.length}</TableCell>
                                                <TableCell className="flex justify-end space-x-3 text-right">
                                                    <Link
                                                        href={aspects.edit(aspect.id).url}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit Aspect"
                                                    >
                                                        <EditIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={aspects.show(aspect.id).url}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Show Aspect"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(aspect.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Hapus Aspect"
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
                            <Button variant="destructive" onClick={() => aspectToDelete && handleDelete(aspectToDelete)}>
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
